import Worker from '../model/Worker.js';
import Category from '../model/Category.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { getPaginationParams, createPaginatedResponse } from '../utils/paginationHelper.js';
import cacheService, { cacheKeys, cacheTTL } from '../utils/cacheService.js';
import Booking from '../model/Booking.js';
import Notification from '../model/Notification.js';
import Review from '../model/Review.js';

// @desc    Get all workers (with optional filters)
// @route   GET /api/workers
// @access  Public (was Admin, now public for user booking page)
export const getWorkers = async (req, res) => {
  try {
    console.log('getWorkers called with query:', req.query);
    const { category, subcategory, minPrice, maxPrice, minRating, latitude, longitude, maxDistance } = req.query;

    // Get pagination params
    const { page, limit, skip } = getPaginationParams(req.query);

    let matchQuery = {};

    // Default to approved unless status is explicitly specified
    if (req.query.status && req.query.status !== 'all') {
      matchQuery.status = req.query.status;
    } else if (req.query.status === 'all') {
      // No status filter, return all
    } else {
      matchQuery.status = 'approved';
    }

    // Filter by subcategory/service name
    if (subcategory) {
      matchQuery.services = { $regex: new RegExp(subcategory, 'i') };
    }
    // Also support 'service' query param which is sent by the mobile app
    if (req.query.service) {
      matchQuery.services = { $regex: new RegExp(req.query.service, 'i') };
    }

    // Filter by category
    if (category) {
      matchQuery.categories = { $regex: new RegExp(category, 'i') };
    }

    // Price filter
    if (minPrice || maxPrice) {
      matchQuery.price = {};
      if (minPrice) matchQuery.price.$gte = Number(minPrice);
      if (maxPrice) matchQuery.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      matchQuery.averageRating = { $gte: Number(minRating) };
    }

    let workers = [];
    let totalCount = 0;

    // Strategy:
    // 1. If Lat/Lng provided, get workers by distance (Geospatial)
    // 2. If City provided, get workers by city name (Text match)
    // 3. Merge results and deduplicate

    const promises = [];

    // 1. Geospatial Query
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            maxDistance: maxDistance ? Number(maxDistance) * 1000 : 50000,
            query: matchQuery,
            spherical: true,
            distanceMultiplier: 0.001,
          },
        },
        {
          $addFields: {
            distance: { $round: ['$distance', 1] }
          }
        },
        // We don't skip/limit here yet because we need to merge first
      ];

      if (req.query.sortBy === 'rating') {
        pipeline.splice(2, 0, { $sort: { averageRating: -1 } });
      }

      promises.push(Worker.aggregate(pipeline).then(res => res.map(w => ({ ...w, source: 'geo' }))));
    }

    // 2. City Query
    if (req.query.city) {
      const cityQuery = {
        ...matchQuery,
        city: { $regex: new RegExp(req.query.city, 'i') }
      };
      promises.push(Worker.find(cityQuery).lean().then(res => res.map(w => ({ ...w, source: 'city', distance: 0 }))));
    }

    // If neither location nor city provided, just standard find
    if (promises.length === 0) {
      const [allWorkers, total] = await Promise.all([
        Worker.find(matchQuery)
          .sort({ averageRating: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Worker.countDocuments(matchQuery)
      ]);
      return res.json(createPaginatedResponse(allWorkers, total, page, limit));
    }

    // Execute queries
    const results = await Promise.all(promises);
    const flattenedWorkers = results.flat();

    // Deduplicate by _id
    const uniqueWorkersMap = new Map();
    flattenedWorkers.forEach(w => {
      if (!uniqueWorkersMap.has(w._id.toString())) {
        uniqueWorkersMap.set(w._id.toString(), w);
      } else {
        // If already exists, prefer the one with 'geo' source (has distance)
        if (w.source === 'geo') {
          uniqueWorkersMap.set(w._id.toString(), w);
        }
      }
    });

    workers = Array.from(uniqueWorkersMap.values());
    totalCount = workers.length;

    // Apply Sorting (if not already sorted by geo)
    if (req.query.sortBy === 'rating') {
      workers.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else {
      // Default sort: Distance (if available), then Rating
      workers.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined && a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        return (b.averageRating || 0) - (a.averageRating || 0);
      });
    }

    // Apply Pagination manually since we merged results
    const paginatedWorkers = workers.slice(skip, skip + limit);

    res.json(createPaginatedResponse(paginatedWorkers, totalCount, page, limit));

  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register a new worker
// @route   POST /api/workers/register
// @access  Public
export const registerWorker = async (req, res) => {
  const {
    firstName,
    lastName,
    mobileNumber,
    email, // Added email
    state,
    district,
    city,
    latitude,
    longitude,
    aadhaarNumber,
    panNumber,
    categories,
    services,
    price,
    password,
    registrationFee,
    paymentId,
  } = req.body;

  let { servicePricing } = req.body;

  // Parse servicePricing if it's a string (from FormData)
  if (typeof servicePricing === 'string') {
    try {
      servicePricing = JSON.parse(servicePricing);
    } catch (error) {
      console.error('Error parsing servicePricing:', error);
      return res.status(400).json({ message: 'Invalid service pricing format' });
    }
  }

  console.log('Registration request received');
  console.log('req.files:', req.files);
  console.log('req.body:', req.body);

  if (!req.files || !req.files.livePhoto || !req.files.aadhaarFront || !req.files.aadhaarBack) {
    console.log('Missing files!');
    console.log('req.files:', req.files);
    return res.status(400).json({ message: 'Please upload live photo and both sides of Aadhaar card.' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const livePhoto = req.files.livePhoto[0].filename;
  const aadhaarFront = req.files.aadhaarFront[0].filename;
  const aadhaarBack = req.files.aadhaarBack[0].filename;
  const panCard = req.files.panCard ? req.files.panCard[0].filename : null; // Optional

  try {
    const workerExists = await Worker.findOne({ mobileNumber });

    if (workerExists) {
      return res.status(400).json({ message: 'Worker already exists with this mobile number' });
    }

    const emailExists = await Worker.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Worker already exists with this email' });
    }

    // Validate servicePricing if provided
    let validatedServicePricing = [];
    if (servicePricing && Array.isArray(servicePricing) && servicePricing.length > 0) {
      // Validate each service
      for (const service of servicePricing) {
        if (!service.serviceName || !service.price || service.price < 0) {
          return res.status(400).json({
            message: 'Each service must have a name and valid price'
          });
        }

        validatedServicePricing.push({
          subCategory: service.subCategoryId || null,
          categoryName: service.categoryName || '',
          serviceName: service.serviceName,
          price: parseFloat(service.price),
          isActive: true
        });
      }
    }

    // Validate and parse coordinates
    const parsedLat = latitude ? parseFloat(latitude) : null;
    const parsedLng = longitude ? parseFloat(longitude) : null;

    // Build worker data object
    const workerData = {
      firstName,
      lastName,
      mobileNumber,
      email, // Added email
      state,
      district,
      city,
      latitude: parsedLat,
      longitude: parsedLng,
      livePhoto,
      aadhaarNumber,
      aadhaarFront,
      aadhaarBack,
      panNumber,
      panCard,
      categories,
      services,
      servicePricing: validatedServicePricing.length > 0 ? validatedServicePricing : [],
      price: price || 0, // Fallback to old system
      password, // Added password
      registrationFee: registrationFee || 0,
      paymentId: paymentId || '',
    };

    // Only add location if both coordinates are valid numbers
    if (parsedLat && parsedLng && !isNaN(parsedLat) && !isNaN(parsedLng)) {
      workerData.location = {
        type: 'Point',
        coordinates: [parsedLng, parsedLat],
      };
    }

    const worker = new Worker(workerData);

    const createdWorker = await worker.save();

    // Generate Token
    const token = jwt.sign({ id: createdWorker._id, role: 'worker' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      worker: { ...createdWorker.toObject(), role: 'worker' },
      token
    });
  } catch (error) {
    console.error('Worker registration error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get workers by sub-category
// @route   GET /api/workers/subcategory/:subCategoryId
// @access  Public
export const getWorkersBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    if (!subCategoryId || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      console.error(`Invalid or missing subCategoryId: ${subCategoryId}`);
      return res.status(400).json({ message: 'Invalid or missing sub-category ID' });
    }
    const { minPrice, maxPrice, minRating, latitude, longitude, maxDistance } = req.query;

    const category = await Category.findOne({ 'subCategories._id': subCategoryId });

    if (!category) {
      console.log(`Sub-category not found for ID: ${subCategoryId}`);
      return res.status(404).json({ message: 'Sub-category not found' });
    }
    console.log(`Found category: ${category.name} for subCategoryId: ${subCategoryId}`);

    const subCategory = category.subCategories.id(subCategoryId);

    // Base query: Workers offering this service
    let matchQuery = { services: { $in: [subCategory.name] } };

    // Price Filter
    if (minPrice || maxPrice) {
      matchQuery.price = {};
      if (minPrice) matchQuery.price.$gte = Number(minPrice);
      if (maxPrice) matchQuery.price.$lte = Number(maxPrice);
    }

    // Rating Filter
    if (minRating) {
      matchQuery.averageRating = { $gte: Number(minRating) };
    }

    const promises = [];

    // 1. Geospatial Query
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            maxDistance: maxDistance ? Number(maxDistance) * 1000 : 50000, // Default 50km
            query: matchQuery,
            spherical: true,
            distanceMultiplier: 0.001, // Convert meters to km
          },
        },
        {
          $addFields: {
            distance: { $round: ['$distance', 1] }
          }
        }
      ];

      if (req.query.sortBy === 'rating') {
        pipeline.push({ $sort: { averageRating: -1 } });
      }

      promises.push(Worker.aggregate(pipeline).then(res => res.map(w => ({ ...w, source: 'geo' }))));
    }

    // 2. City Query
    if (req.query.city) {
      const cityQuery = {
        ...matchQuery,
        city: { $regex: new RegExp(req.query.city, 'i') }
      };
      promises.push(Worker.find(cityQuery).lean().then(res => res.map(w => ({ ...w, source: 'city', distance: 0 }))));
    }

    // If neither, just find
    if (promises.length === 0) {
      const workers = await Worker.find(matchQuery);
      return res.json(workers);
    }

    // Execute and Merge
    const results = await Promise.all(promises);
    const flattenedWorkers = results.flat();

    // Deduplicate
    const uniqueWorkersMap = new Map();
    flattenedWorkers.forEach(w => {
      if (!uniqueWorkersMap.has(w._id.toString())) {
        uniqueWorkersMap.set(w._id.toString(), w);
      } else {
        if (w.source === 'geo') uniqueWorkersMap.set(w._id.toString(), w);
      }
    });

    const workers = Array.from(uniqueWorkersMap.values());
    res.json(workers);

  } catch (error) {
    console.error('Error getting workers by sub-category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get workers by category
// @route   GET /api/workers/category/:categoryId
// @access  Public
export const getWorkersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      console.error(`Invalid or missing categoryId: ${categoryId}`);
      return res.status(400).json({ message: 'Invalid or missing category ID' });
    }

    const { minPrice, maxPrice, minRating, latitude, longitude, maxDistance } = req.query;

    // Find the category and get all subcategory names
    const category = await Category.findById(categoryId);

    if (!category) {
      console.log(`Category not found for ID: ${categoryId}`);
      return res.status(404).json({ message: 'Category not found' });
    }

    console.log(`Found category: ${category.name} with ${category.subCategories?.length || 0} subcategories`);

    // Get all service names from subcategories
    const serviceNames = category.subCategories?.map(sub => sub.name) || [];

    if (serviceNames.length === 0) {
      console.log(`No subcategories found for category: ${category.name}`);
      return res.json([]); // Return empty array if no services
    }

    // Base query: Workers offering any service in this category
    let matchQuery = {
      services: { $in: serviceNames },
      status: 'approved' // Only show approved workers
    };

    // Price Filter
    if (minPrice || maxPrice) {
      matchQuery.price = {};
      if (minPrice) matchQuery.price.$gte = Number(minPrice);
      if (maxPrice) matchQuery.price.$lte = Number(maxPrice);
    }

    // Rating Filter
    if (minRating) {
      matchQuery.averageRating = { $gte: Number(minRating) };
    }

    const promises = [];

    // 1. Geospatial Query
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            maxDistance: maxDistance ? Number(maxDistance) * 1000 : 50000, // Default 50km
            query: matchQuery,
            spherical: true,
            distanceMultiplier: 0.001, // Convert meters to km
          },
        },
        {
          $addFields: {
            distance: { $round: ['$distance', 1] }
          }
        }
      ];

      if (req.query.sortBy === 'rating') {
        pipeline.push({ $sort: { averageRating: -1 } });
      }

      promises.push(Worker.aggregate(pipeline).then(res => res.map(w => ({ ...w, source: 'geo' }))));
    }

    // 2. City Query
    if (req.query.city) {
      const cityQuery = {
        ...matchQuery,
        city: { $regex: new RegExp(req.query.city, 'i') }
      };
      promises.push(Worker.find(cityQuery).lean().then(res => res.map(w => ({ ...w, source: 'city', distance: 0 }))));
    }

    // If neither, just find
    if (promises.length === 0) {
      const workers = await Worker.find(matchQuery).sort({ averageRating: -1, createdAt: -1 });
      return res.json(workers);
    }

    // Execute and Merge
    const results = await Promise.all(promises);
    const flattenedWorkers = results.flat();

    // Deduplicate
    const uniqueWorkersMap = new Map();
    flattenedWorkers.forEach(w => {
      if (!uniqueWorkersMap.has(w._id.toString())) {
        uniqueWorkersMap.set(w._id.toString(), w);
      } else {
        if (w.source === 'geo') uniqueWorkersMap.set(w._id.toString(), w);
      }
    });

    const workers = Array.from(uniqueWorkersMap.values());
    console.log(`Found ${workers.length} workers for category ${category.name}`);
    res.json(workers);

  } catch (error) {
    console.error('Error getting workers by category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Approve a worker
// @route   PUT /api/workers/:id/approve
// @access  Admin
export const approveWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (worker) {
      worker.status = 'approved';
      const updatedWorker = await worker.save();
      res.json(updatedWorker);
    } else {
      res.status(404).json({ message: 'Worker not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reject a worker
// @route   PUT /api/workers/:id/reject
// @access  Admin
export const rejectWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (worker) {
      worker.status = 'rejected';
      const updatedWorker = await worker.save();
      res.json(updatedWorker);
    } else {
      res.status(404).json({ message: 'Worker not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get worker by mobile number
// @route   GET /api/workers/mobile/:mobileNumber
// @access  Public
export const getWorkerByMobileNumber = async (req, res) => {
  try {
    const worker = await Worker.findOne({ mobileNumber: req.params.mobileNumber });

    if (worker) {
      res.json(worker);
    } else {
      res.status(404).json({ message: 'Worker not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get worker statistics
// @route   GET /api/workers/:id/stats
// @access  Private (Admin/Worker itself)
export const getWorkerStats = async (req, res) => {
  try {
    const workerId = req.params.id;
    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Calculate stats
    const totalBookings = await Booking.countDocuments({ worker: workerId });
    const pendingBookings = await Booking.countDocuments({ worker: workerId, status: 'pending' });
    const activeBookings = await Booking.countDocuments({ worker: workerId, status: { $in: ['accepted', 'in-progress'] } });
    const completedBookings = await Booking.countDocuments({ worker: workerId, status: 'completed' });

    // Calculate earnings (sum of totalAmount for completed bookings)
    const earningsResult = await Booking.aggregate([
      { $match: { worker: new mongoose.Types.ObjectId(workerId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$finalPrice' } } }
    ]);
    const earnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

    const stats = {
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      earnings,
      rating: worker.averageRating || 0,
      walletBalance: 0, // Placeholder until Wallet system is implemented for workers
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching worker stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get worker notifications
// @route   GET /api/workers/:id/notifications
// @access  Private (Admin/Worker itself)
export const getWorkerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.params.id,
      recipientModel: 'Worker'
    }).sort({ createdAt: -1 }).limit(20);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching worker notifications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get worker feedback
// @route   GET /api/workers/:id/feedback
// @access  Private (Admin/Worker itself)
export const getWorkerFeedback = async (req, res) => {
  try {
    const feedback = await Review.find({ worker: req.params.id })
      .populate('user', 'name profileImage') // Assuming User model has profileImage
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching worker feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update worker details
// @route   PUT /api/workers/:id
// @access  Admin
export const updateWorkerDetails = async (req, res) => {
  const {
    firstName,
    lastName,
    mobileNumber,
    state,
    district,
    city,
    latitude,
    longitude,
    aadhaarNumber, // New
    panNumber, // New
    categories,
    services,
    status,
    workerType,
    price, // New: Add price field
  } = req.body;

  try {
    const fs = await import('fs');
    fs.appendFileSync('backend_error_log.txt', `[${new Date().toISOString()}] updateWorkerDetails called. Params: ${JSON.stringify(req.params)}, Body: ${JSON.stringify(req.body)}, User: ${req.user ? req.user._id : 'No User'}\n`);

    // Authorization Check
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(401).json({ message: 'Not authorized to update this worker' });
    }

    const worker = await Worker.findById(req.params.id);
    const { email } = req.body;

    if (worker) {
      worker.firstName = firstName || worker.firstName;
      worker.lastName = lastName || worker.lastName;
      worker.email = email || worker.email;
      worker.mobileNumber = mobileNumber || worker.mobileNumber;
      worker.state = state || worker.state;
      worker.district = district || worker.district;
      worker.city = city || worker.city;
      worker.latitude = latitude || worker.latitude;
      worker.longitude = longitude || worker.longitude;
      worker.aadhaarNumber = aadhaarNumber || worker.aadhaarNumber; // New
      worker.panNumber = panNumber || worker.panNumber; // New
      worker.categories = categories || worker.categories;
      worker.services = services || worker.services;
      worker.status = status || worker.status;
      worker.workerType = workerType || worker.workerType;
      worker.status = status || worker.status;
      worker.workerType = workerType || worker.workerType;
      worker.price = price || worker.price; // New: Update price
      worker.bankDetails = req.body.bankDetails || worker.bankDetails; // New
      worker.upiId = req.body.upiId || worker.upiId; // New

      if (latitude && longitude) {
        worker.location = {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        };
      }

      // Handle file uploads if new files are provided
      if (req.files && req.files.livePhoto) {
        worker.livePhoto = req.files.livePhoto[0].filename;
      }
      if (req.files && req.files.aadhaarFront) {
        worker.aadhaarFront = req.files.aadhaarFront[0].filename;
      }
      if (req.files && req.files.aadhaarBack) {
        worker.aadhaarBack = req.files.aadhaarBack[0].filename;
      }
      if (req.files && req.files.panCard) { // New
        worker.panCard = req.files.panCard[0].filename;
      }

      const updatedWorker = await worker.save();
      res.json(updatedWorker);
    } else {
      res.status(404).json({ message: 'Worker not found' });
    }
  } catch (error) {
    console.error('Error updating worker details:', error);
    const fs = await import('fs');
    fs.appendFileSync('backend_error_log.txt', `[${new Date().toISOString()}] Error in updateWorkerDetails: ${error.stack}\n`);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Public
export const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .select('-password -tokens -__v -bankDetails -upiId -aadhaarNumber -panNumber');
    if (worker) {
      res.json(worker);
    } else {
      res.status(404).json({ message: 'Worker not found' });
    }
  } catch (error) {
    console.error('Error fetching worker by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// @desc    Get worker support tickets
// @route   GET /api/workers/support
// @access  Private (Worker)
export const getWorkerTickets = async (req, res) => {
  try {
    const SupportTicket = (await import('../model/SupportTicket.js')).default;

    const tickets = await SupportTicket.find({
      user: req.user._id,
      userModel: 'Worker'
    }).sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Server error while fetching support tickets' });
  }
};

// @desc    Create worker support ticket
// @route   POST /api/workers/support
// @access  Private (Worker)
export const createWorkerTicket = async (req, res) => {
  try {
    const SupportTicket = (await import('../model/SupportTicket.js')).default;
    const { subject, message, category } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      userType: 'worker',
      subject,
      messages: [{
        sender: 'user',
        senderId: req.user._id,
        senderModel: 'Worker',
        message: message
      }],
      status: 'open'
    });

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Server error while creating support ticket' });
  }
};

// @desc    Get single ticket details
// @route   GET /api/workers/support/:id
// @access  Private (Worker)
export const getWorkerTicketById = async (req, res) => {
  try {
    const SupportTicket = (await import('../model/SupportTicket.js')).default;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== req.user._id.toString() || ticket.userModel !== 'Worker') {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Server error while fetching ticket' });
  }
};

// @desc    Add reply to ticket
// @route   POST /api/workers/support/:id/reply
// @access  Private (Worker)
export const addWorkerReply = async (req, res) => {
  try {
    const SupportTicket = (await import('../model/SupportTicket.js')).default;
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== req.user._id.toString() || ticket.userModel !== 'Worker') {
      return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
    }

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    ticket.replies.push({
      sender: req.user._id,
      senderModel: 'Worker',
      message,
      createdAt: new Date()
    });

    ticket.status = 'in-progress';
    await ticket.save();

    res.json({
      message: 'Reply added successfully',
      ticket
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error while adding reply' });
  }
};
