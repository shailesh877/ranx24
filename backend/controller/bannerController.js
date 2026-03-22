import Banner from '../model/Banner.js';
import fs from 'fs';
import { toBoolean } from '../utils/typeConverter.js';


// @desc    Add a new banner
// @route   POST /api/banners
// @access  Private/Admin
const addBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image for the banner' });
    }

    const { title, description, link, type, displayPages, displayOrder, startDate, endDate, platform } = req.body;

    const banner = await Banner.create({
      title,
      description,
      image: req.file.path.replace(/\\/g, '/'),
      link,
      type: type || 'slider',
      displayPages: displayPages ? JSON.parse(displayPages) : [],
      platform: platform || 'all',
      displayOrder: displayOrder || 0,
      startDate,
      endDate
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create banner', error: error.message });
  }
};

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
  try {
    const { platform } = req.query;

    const filter = {};
    if (platform && platform !== 'all') {
      filter.$or = [
        { platform: platform },
        { platform: 'all' }
      ];
    }

    const banners = await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banners', error: error.message });
  }
};

// @desc    Get active banners for a specific page
// @route   GET /api/banners/active/:page
// @access  Public
const getActiveBanners = async (req, res) => {
  try {
    const { page } = req.params;
    const { platform } = req.query; // Get platform from query params
    const now = new Date();

    const filter = {
      isActive: true,
      $or: [
        { displayPages: page },
        { displayPages: 'all' }
      ],
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ]
    };

    // Add platform filtering if specified
    if (platform && platform !== 'all') {
      filter.$and.push({
        $or: [
          { platform: platform },
          { platform: 'all' }
        ]
      });
    }

    const banners = await Banner.find(filter).sort({ displayOrder: 1 });

    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active banners', error: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const { title, description, link, type, displayPages, displayOrder, startDate, endDate, isActive, platform } = req.body;

    // Update fields
    if (title !== undefined) banner.title = title;
    if (description !== undefined) banner.description = description;
    if (link !== undefined) banner.link = link;
    if (type) banner.type = type;
    if (displayPages) banner.displayPages = JSON.parse(displayPages);
    if (platform) banner.platform = platform;
    if (displayOrder !== undefined) banner.displayOrder = displayOrder;
    if (startDate !== undefined) banner.startDate = startDate;
    if (endDate !== undefined) banner.endDate = endDate;
    if (isActive !== undefined) banner.isActive = toBoolean(isActive);

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image
      if (banner.image && fs.existsSync(banner.image)) {
        try {
          fs.unlinkSync(banner.image);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      banner.image = req.file.path.replace(/\\/g, '/');
    }

    const updatedBanner = await banner.save();
    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update banner', error: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Delete image file
    if (banner.image && fs.existsSync(banner.image)) {
      try {
        fs.unlinkSync(banner.image);
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }

    await banner.deleteOne();
    res.status(200).json({ message: 'Banner removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete banner', error: error.message });
  }
};

// @desc    Toggle banner status
// @route   PATCH /api/banners/:id/toggle
// @access  Private/Admin
const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    const updatedBanner = await banner.save();

    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle banner status', error: error.message });
  }
};

export {
  addBanner,
  getBanners,
  getActiveBanners,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
};