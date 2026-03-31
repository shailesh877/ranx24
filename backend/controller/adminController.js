import Admin from '../model/Admin.js';

import User from '../model/User.js';
import Worker from '../model/Worker.js';
import Booking from '../model/Booking.js';
import Review from '../model/Review.js';
import Wallet from '../model/userWallet.js';
import WorkerWallet from '../model/WorkerWallet.js';
import WithdrawalRequest from '../model/WithdrawalRequest.js';
import jwt from 'jsonwebtoken';
import UserMembership from '../model/UserMembership.js';
import UserAMC from '../model/UserAMC.js';
import MembershipPlan from '../model/MembershipPlan.js';
import AMCPlan from '../model/AMCPlan.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    // Enrich users with active membership and AMC
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      // Robust manual enrichment to bypass population failures on type mismatch
      let membership = await UserMembership.findOne({
        $or: [
          { customer_id: user._id },
          { customer_id: user._id.toString() }
        ],
        status: { $regex: /^active$/i }
      }).lean();

      if (membership && membership.plan_id) {
        const plan = await MembershipPlan.findById(membership.plan_id).lean();
        membership.planName = plan?.name || 'Active Plan';
        membership.expiry = membership.expiry_date;
      }

      let amc = await UserAMC.findOne({
        $or: [
          { customer_id: user._id },
          { customer_id: user._id.toString() }
        ],
        status: { $regex: /^active$/i }
      }).lean();

      if (amc && amc.plans && amc.plans.length > 0) {
        const amcPlan = await AMCPlan.findById(amc.plans[0]).lean();
        amc.planName = amcPlan?.name || 'Active AMC';
        amc.contractNumber = amc.contract_number;
        amc.expiry = amc.end_date;
      }

      return {
        ...user,
        membership: membership ? {
          planName: membership.planName,
          expiry: membership.expiry
        } : null,
        amc: amc ? {
          planName: amc.planName,
          contractNumber: amc.contractNumber,
          expiry: amc.expiry
        } : null
      };
    }));

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Counts
    const userCount = await User.countDocuments();
    const workerCount = await Worker.countDocuments();
    const pendingWorkers = await Worker.countDocuments({ status: 'pending' });
    const verifiedWorkers = await Worker.countDocuments({ status: 'approved' });
    const bookingCount = await Booking.countDocuments();

    // 2. Booking Stats
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const bookingsToday = await Booking.countDocuments({ createdAt: { $gte: startOfDay } });
    const bookingsMonth = await Booking.countDocuments({ createdAt: { $gte: startOfMonth } });

    // 3. Earnings (Platform Fee from completed bookings)
    const earningsAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);
    const earnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

    // 4. Wallet Stats
    // Total In: Sum of amountPaid from paid bookings
    const totalInAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalIn = totalInAgg.length > 0 ? totalInAgg[0].total : 0;

    // Total Out: Sum of payouts from Wallets
    const totalOutAgg = await Wallet.aggregate([
      { $unwind: '$transactions' },
      { $match: { 'transactions.type': 'payout' } },
      { $group: { _id: null, total: { $sum: { $abs: '$transactions.amount' } } } }
    ]);
    const totalOut = totalOutAgg.length > 0 ? totalOutAgg[0].total : 0;

    const availableWallet = (await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]))[0]?.total || 0;

    // Pending Payments (Completed bookings that are not paid)
    const pendingPaymentsAgg = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: { $ne: 'paid' } } },
      { $group: { _id: null, total: { $sum: '$finalPrice' } } }
    ]);
    const pendingPayments = pendingPaymentsAgg.length > 0 ? pendingPaymentsAgg[0].total : 0;

    // 5. Review Stats
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    const avgRating = reviewStats.length > 0 ? reviewStats[0].avgRating.toFixed(1) : 0;
    const totalReviews = reviewStats.length > 0 ? reviewStats[0].count : 0;

    // Reviews this week
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const reviewsWeek = await Review.countDocuments({ createdAt: { $gte: startOfWeek } });

    const response = {
      users: userCount,
      workers: workerCount,
      workersPending: pendingWorkers,
      verifiedWorkers: verifiedWorkers,
      bookings: bookingCount,
      // Shared stats
      completedBookings,
      bookingsToday,
      bookingsMonth,
      // Placeholders
      activeServices: 0,
      availableCities: 0,
      reviews: {
        average: avgRating,
        total: totalReviews,
        week: reviewsWeek
      }
    };

    // Only add Financial Stats if NOT employee
    if (req.user.role !== 'employee') {
      response.earnings = earnings;
      response.wallet = {
        totalIn,
        totalOut,
        available: availableWallet,
        pending: pendingPayments
      };
    }

    res.json(response);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const adminRegister = async (req, res) => {
  const { mobileNumber, password } = req.body;

  try {
    // Check if admin with mobile number already exists
    let admin = await Admin.findOne({ mobileNumber });
    if (admin) {
      return res.status(400).json({ message: 'Admin with this mobile number already exists' });
    }

    // Create new admin
    admin = new Admin({
      mobileNumber,
      password, // NOTE: In a real application, hash the password before saving
    });

    await admin.save();

    // Generate Token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Admin registered successfully',
      adminId: admin._id,
      token,
      user: {
        _id: admin._id,
        mobileNumber: admin.mobileNumber,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const user = new User({
      name,
      email,
      phone,
    });

    const createdUser = await user.save();
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (user) {
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const adminLogin = async (req, res) => {
  let { mobileNumber, password } = req.body;
  mobileNumber = String(mobileNumber || '').trim();
  password = String(password || '').trim();
  console.log('🔑 Admin Login Request Body:', req.body);
  console.log(`🔑 Admin Login Attempt - Mobile: "${mobileNumber}"`);

  try {
    const adminCount = await Admin.countDocuments();
    console.log(`📊 Total Admins in DB: ${adminCount}`);

    // Find admin by mobile number
    const admin = await Admin.findOne({ mobileNumber });

    // Check if admin exists
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found with this mobile number' });
    }

    // Compare passwords
    if (admin.password !== password) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate Token
    const token = jwt.sign({ id: admin._id, role: admin.role || 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // If credentials are valid
    res.status(200).json({
      message: 'Admin login successful',
      adminId: admin._id,
      token,
      user: {
        _id: admin._id,
        mobileNumber: admin.mobileNumber,
        name: admin.name,
        role: admin.role || 'superadmin' // Default to superadmin for backward compatibility
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: `Server error during login: ${error.message}` });
  }
};

// @desc    Get all withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private (Admin)
export const getWithdrawalRequests = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({})
      .populate('worker', 'firstName lastName mobileNumber bankDetails upiId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get payout history (Approved withdrawals)
// @route   GET /api/admin/payout-history
// @access  Private (Admin)
export const getPayoutHistory = async (req, res) => {
  try {
    const history = await WithdrawalRequest.find({ status: 'approved' })
      .populate('worker', 'firstName lastName mobileNumber bankDetails upiId')
      .sort({ processedAt: -1 });

    const totalPaidAgg = await WithdrawalRequest.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalPaid = totalPaidAgg.length > 0 ? totalPaidAgg[0].total : 0;

    res.json({
      totalPaid,
      history
    });
  } catch (error) {
    console.error('Error fetching payout history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve withdrawal request
// @route   PUT /api/admin/withdrawals/:id/approve
// @access  Private (Admin)
export const approveWithdrawal = async (req, res) => {
  try {
    const request = await WithdrawalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'approved';
    request.processedAt = Date.now();
    await request.save();

    res.json({ message: 'Withdrawal approved', request });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject withdrawal request
// @route   PUT /api/admin/withdrawals/:id/reject
// @access  Private (Admin)
export const rejectWithdrawal = async (req, res) => {
  const { reason } = req.body;
  try {
    const request = await WithdrawalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'rejected';
    request.processedAt = Date.now();
    request.adminNote = reason;
    await request.save();

    // Refund balance to worker wallet
    const wallet = await WorkerWallet.findOne({ worker: request.worker });
    if (wallet) {
      wallet.balance += request.amount;
      wallet.transactions.push({
        type: 'credit',
        amount: request.amount,
        description: `Refund: Withdrawal Rejected (${reason || 'No reason'})`,
        withdrawalRequestId: request._id
      });
      await wallet.save();
    }

    res.json({ message: 'Withdrawal rejected and refunded', request });
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new Employee (Restricted Admin)
// @route   POST /api/admin/employees
// @access  Private (Super Admin)
export const createEmployee = async (req, res) => {
  try {
    const { name, mobileNumber, password } = req.body;

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ mobileNumber });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin/Employee already exists with this number' });
    }

    const employee = await Admin.create({
      name,
      mobileNumber,
      password, // Note: In production use hashing!
      role: 'employee'
    });

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private (Super Admin)
export const getEmployees = async (req, res) => {
  try {
    const employees = await Admin.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete employee
// @route   DELETE /api/admin/employees/:id
// @access  Private (Super Admin)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Admin.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.role !== 'employee') {
      return res.status(400).json({ message: 'Cannot delete super admin' });
    }

    await employee.deleteOne();
    res.json({ message: 'Employee removed' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Change Admin/Employee Password
// @route   PUT /api/admin/change-password
// @access  Private (Admin/Employee)
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check old password (simple string comparison as per existing logic)
    // NOTE: In production, both oldPassword and admin.password should be hashed
    if (admin.password !== oldPassword) {
      return res.status(400).json({ message: 'Invalid old password' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
