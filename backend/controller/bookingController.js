import Booking from '../model/Booking.js';
import User from '../model/User.js';
import Worker from '../model/Worker.js';
import Service from '../model/Service.js';
import WorkerWallet from '../model/WorkerWallet.js';
import Coupon from '../model/Coupon.js';
import CouponUsage from '../model/CouponUsage.js';
import CoinConfig from '../model/CoinConfig.js';
import { ensureWallet, creditYCCoins } from './userwalletController.js';
import Razorpay from 'razorpay';
import UserMembership from '../model/UserMembership.js';
import MembershipPlan from '../model/MembershipPlan.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
import { deductCoins, awardCashback } from './coinsController.js';
import { getPaginationParams, createPaginatedResponse } from '../utils/paginationHelper.js';
import { createNotification } from './notificationController.js';
import FeeConfig from '../model/FeeConfig.js';
import { getDistance } from '../utils/haversine.js';
import emailService from '../utils/emailService.js';

// NEW: Query based bookings for Worker App
export const getBookingsByQuery = async (req, res) => {
  try {
    const { worker, limit = 5 } = req.query;

    if (!worker) {
      return res.status(400).json({ message: "Worker ID is required" });
    }

    const bookings = await Booking.find({ worker })
      .populate("user", "name mobileNumber livePhoto address")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (err) {
    console.error("Worker Query Bookings Error:", err);
    res.status(500).json({ message: "Server Error loading bookings" });
  }
};


// Helper: Calculate Membership Discount
const getMembershipDiscount = async (userId, price) => {
  try {
    const membership = await UserMembership.findOne({
      customer_id: userId,
      status: 'Active',
      expiry_date: { $gte: new Date().toISOString().split('T')[0] }
    }).populate('plan_id');

    if (!membership || !membership.plan_id) return { discount: 0, planId: null };

    const tiers = membership.plan_id.discount_tiers || [];
    let applicablePercentage = 0;

    tiers.forEach(tier => {
      const minAmount = parseFloat(tier.min_amount || 0);
      const discountPercent = parseFloat(tier.discount_percentage || 0);
      if (price >= minAmount && discountPercent > applicablePercentage) {
        applicablePercentage = discountPercent;
      }
    });

    if (applicablePercentage > 0) {
      const discount = Math.round((price * applicablePercentage) / 100);
      return { discount, planId: membership.plan_id._id };
    }

    return { discount: 0, planId: membership.plan_id._id };
  } catch (error) {
    console.error('Error calculating membership discount:', error);
    return { discount: 0, planId: null };
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
export const createBooking = async (req, res) => {
  console.log('createBooking called with body:', req.body);
  console.log('createBooking user:', req.user);
  const {
    serviceId, category, service, description, bookingDate, bookingTime, address,
    price, bookingType, days, startDate, endDate, paymentStatus, paymentId,
    couponCode, coinsUsed, walletAmountUsed, amountPaid
  } = req.body;

  // Basic validation
  if (!category || !service || !bookingDate || !bookingTime || !address || !price) {
    return res.status(400).json({ message: 'Please enter all required fields for the booking.' });
  }

  try {
    // Validate Service if provided
    if (serviceId) {
      const serviceObj = await Service.findById(serviceId);
      if (!serviceObj) {
        return res.status(404).json({ message: 'Service not found.' });
      }
    }

    // Worker is NOT assigned yet.
    // We skip worker availability check.

    let totalPrice = price;
    let platformFee = 0;
    let travelCharge = 0;
    let distance = 0;

    // ========== FEE CALCULATION ==========
    const feeConfig = await FeeConfig.getSingleton();
    let percentageFee = 0;

    if (feeConfig.isActive) {
      platformFee = feeConfig.platformFee;

      // Calculate Percentage Fee
      if (feeConfig.percentageCharge > 0) {
        percentageFee = Math.round((price * feeConfig.percentageCharge) / 100);
      }
    }

    // Add fees to total price
    totalPrice += platformFee + percentageFee;

    // ========== MEMBERSHIP DISCOUNT ==========
    const { discount: membershipDiscount, planId: membershipPlanId } = await getMembershipDiscount(req.user._id, price);
    totalPrice -= membershipDiscount;

    let couponDiscount = 0;
    let coinDiscount = 0;
    let couponId = null;
    let actualCouponCode = null;

    // ========== COUPON VALIDATION ==========
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }

      // Validate coupon
      if (!coupon.isActive) {
        return res.status(400).json({ message: 'Coupon is not active' });
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return res.status(400).json({ message: 'Coupon has expired or not yet valid' });
      }

      // Check usage limits
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }

      // Check user usage limit
      const userUsageCount = await CouponUsage.countDocuments({
        coupon: coupon._id,
        user: req.user._id
      });

      if (userUsageCount >= coupon.userUsageLimit) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }

      // Check minimum order value
      if (price < coupon.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value of ₹${coupon.minOrderValue} required`
        });
      }

      // Calculate discount
      if (coupon.type === 'percentage') {
        couponDiscount = (price * coupon.value) / 100;
        if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
          couponDiscount = coupon.maxDiscount;
        }
      } else {
        couponDiscount = coupon.value;
      }

      couponDiscount = Math.round(couponDiscount);
      totalPrice -= couponDiscount;
      couponId = coupon._id;
      actualCouponCode = coupon.code;

      // Update coupon usage count
      coupon.usageCount += 1;
      await coupon.save();
    }

    // ========== COINS DEDUCTION ==========
    if (coinsUsed && coinsUsed > 0) {
      // Get coin config
      const config = await CoinConfig.findOne();
      const coinToRupeeRate = config?.coinToRupeeRate || 1;
      const maxUsagePercentage = config?.maxUsagePercentage || 50;

      // Calculate max coins that can be used on remaining amount
      const maxAmountFromCoins = (totalPrice * maxUsagePercentage) / 100;
      const maxCoinsAllowed = Math.floor(maxAmountFromCoins / coinToRupeeRate);

      if (coinsUsed > maxCoinsAllowed) {
        return res.status(400).json({
          message: `You can only use up to ${maxCoinsAllowed} coins for this booking (${maxUsagePercentage}% of order)`
        });
      }

      // Deduct coins
      try {
        await deductCoins(req.user._id, null, coinsUsed); // bookingId will be added later
        coinDiscount = coinsUsed * coinToRupeeRate;
        totalPrice -= coinDiscount;
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    // ========== WALLET PAYMENT ==========
    let walletDeducted = 0;
    if (walletAmountUsed && walletAmountUsed > 0) {
      const wallet = await ensureWallet(req.user._id);
      if (wallet.balance < walletAmountUsed) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Calculate remaining amount to pay
      const remainingToPay = totalPrice; // After coupon and coins

      if (walletAmountUsed > remainingToPay) {
        return res.status(400).json({ message: 'Wallet amount exceeds payable amount' });
      }

      wallet.balance -= walletAmountUsed;
      wallet.transactions.push({
        type: 'debit',
        amount: walletAmountUsed,
        note: 'Used for booking payment',
        meta: { type: 'booking_payment' }
      });
      await wallet.save();
      walletDeducted = walletAmountUsed;
    }

    const finalPrice = Math.max(0, totalPrice); // This is price after discounts. 
    // Wait, finalPrice in DB usually means "Amount User Has To Pay".
    // If wallet is used, does finalPrice reduce? 
    // Usually finalPrice = Total - Discounts. Wallet is a PAYMENT METHOD.
    // So finalPrice remains same (amount to be paid), but paymentStatus becomes 'paid' if wallet covers it.
    // OR, finalPrice is "Remaining Amount to Pay via External Method".
    // Let's stick to: finalPrice = Total - Discounts (Coupon/Coins). 
    // Wallet is just a partial payment.

    let statusOfPayment = paymentStatus || 'pending';
    const actualAmountPaid = amountPaid || 0;

    if (walletDeducted >= finalPrice && finalPrice > 0) {
      statusOfPayment = 'paid';
    } else if (actualAmountPaid > 0 && actualAmountPaid < finalPrice) {
      statusOfPayment = 'partial';
    } else if (actualAmountPaid >= finalPrice && finalPrice > 0) {
      statusOfPayment = 'paid';
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      // worker: workerId, // Worker is not assigned yet
      serviceId,
      category,
      service,
      description,
      bookingDate,
      bookingTime,
      address,
      price, // Original price
      totalPrice: totalPrice, // Total BEFORE discount (variable totalPrice calculated above)
      couponApplied: couponId,
      couponCode: actualCouponCode,
      couponDiscount,
      coinsUsed: coinsUsed || 0,
      coinDiscount,
      walletAmountUsed: walletDeducted,
      finalPrice,
      amountPaid: actualAmountPaid + walletDeducted,
      paymentStatus: statusOfPayment,
      paymentId,
      isAdvancePayment: req.body.isAdvancePayment || false,
      advanceAmount: req.body.advanceAmount || 0,
      bookingType: bookingType || 'full-day',
      days: days || 1,
      startDate,
      endDate,
      status: 'pending',
      membershipDiscount: membershipDiscount,
      membershipApplied: membershipPlanId,
      platformFee: platformFee,
      percentageFee: percentageFee,
      distance: distance
    });

    const createdBooking = await booking.save();

    // Record coupon usage
    if (couponId) {
      await CouponUsage.create({
        coupon: couponId,
        user: req.user._id,
        booking: createdBooking._id,
        discountAmount: couponDiscount
      });
    }

    // Award cashback coins
    if (finalPrice > 0) {
      const cashbackEarned = await awardCashback(req.user._id, createdBooking._id, finalPrice);
      if (cashbackEarned) {
        createdBooking.cashbackEarned = cashbackEarned;
        await createdBooking.save();
      }
    }

    // Notify Admin (Optional - or just let them see in dashboard)
    // We can emit to an 'admin' room if we have one.

    // Worker notification is MOVED to assignWorker function.

    // Send booking confirmation email
    try {
      const user = await User.findById(req.user._id).select('name email');
      if (user && user.email) {
        await emailService.sendBookingConfirmation(user, createdBooking);
      }
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't block booking creation if email fails
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
};

// @desc    Create multiple bookings (Bulk)
// @route   POST /api/bookings/bulk
// @access  Private (User)
export const createBulkBookings = async (req, res) => {
  console.log('createBulkBookings called with body:', JSON.stringify(req.body, null, 2));
  console.log('createBulkBookings user:', req.user);
  const {
    bookings, // Array of booking objects
    paymentStatus,
    paymentId,
    couponCode,
    coinsUsed,
    walletAmountUsed,
    amountPaid,
    address, // Shared address for all bookings
    isAdvancePayment,
    advanceAmount
  } = req.body;

  // Save address to user profile if provided
  if (address && req.user) {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        // Check if address already exists to avoid duplicates
        const addressExists = user.addresses.some(addr =>
          addr.street === address.street &&
          addr.city === address.city &&
          addr.zipCode === address.zipCode
        );

        if (!addressExists) {
          user.addresses.push(address);
          await user.save();
        }
      }
    } catch (err) {
      console.error("Error saving user address:", err);
      // Continue with booking even if address save fails
    }
  }

  if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
    return res.status(400).json({ message: 'No bookings provided.' });
  }

  try {
    // 1. Calculate Total Price
    let totalOrderPrice = 0;
    for (const item of bookings) {
      if (!item.price) {
        return res.status(400).json({ message: 'Price is required for all items.' });
      }
      totalOrderPrice += item.price;
    }

    let platformFee = 0;
    let travelCharge = 0;
    let distance = 0;

    // ========== FEE CALCULATION ==========
    const feeConfig = await FeeConfig.getSingleton();
    let percentageFee = 0;

    if (feeConfig.isActive) {
      platformFee = feeConfig.platformFee;

      // Calculate Percentage Fee
      if (feeConfig.percentageCharge > 0) {
        // Calculate percentage on the sum of item prices
        percentageFee = Math.round((totalOrderPrice * feeConfig.percentageCharge) / 100);
      }
    }

    // Add fees to total price
    totalOrderPrice += platformFee + percentageFee;

    // ========== MEMBERSHIP DISCOUNT ==========
    const { discount: totalMembershipDiscount, planId: membershipPlanId } = await getMembershipDiscount(req.user._id, totalOrderPrice - platformFee - percentageFee);
    totalOrderPrice -= totalMembershipDiscount;

    let totalCouponDiscount = 0;
    let totalCoinDiscount = 0;
    let couponId = null;
    let actualCouponCode = null;

    // 2. Coupon Validation (Once for the whole order)
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }

      if (!coupon.isActive) {
        return res.status(400).json({ message: 'Coupon is not active' });
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return res.status(400).json({ message: 'Coupon has expired or not yet valid' });
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }

      const userUsageCount = await CouponUsage.countDocuments({
        coupon: coupon._id,
        user: req.user._id
      });

      if (userUsageCount >= coupon.userUsageLimit) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }

      if (totalOrderPrice < coupon.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value of ₹${coupon.minOrderValue} required`
        });
      }

      // Calculate discount
      if (coupon.type === 'percentage') {
        totalCouponDiscount = (totalOrderPrice * coupon.value) / 100;
        if (coupon.maxDiscount && totalCouponDiscount > coupon.maxDiscount) {
          totalCouponDiscount = coupon.maxDiscount;
        }
      } else {
        totalCouponDiscount = coupon.value;
      }

      totalCouponDiscount = Math.round(totalCouponDiscount);
      couponId = coupon._id;
      actualCouponCode = coupon.code;

      // Update coupon usage count
      coupon.usageCount += 1;
      await coupon.save();
    }

    // 3. Coins Deduction (Once for the whole order)
    if (coinsUsed && coinsUsed > 0) {
      const config = await CoinConfig.findOne();
      const coinToRupeeRate = config?.coinToRupeeRate || 1;
      const maxUsagePercentage = config?.maxUsagePercentage || 50;

      // Calculate max coins based on total price (after coupon if you want, but usually on base price or price-coupon)
      // Let's follow the logic: Price - Coupon - Coins
      const priceAfterCoupon = totalOrderPrice - totalCouponDiscount;
      const maxAmountFromCoins = (priceAfterCoupon * maxUsagePercentage) / 100;
      const maxCoinsAllowed = Math.floor(maxAmountFromCoins / coinToRupeeRate);

      if (coinsUsed > maxCoinsAllowed) {
        return res.status(400).json({
          message: `You can only use up to ${maxCoinsAllowed} coins for this order`
        });
      }

      try {
        await deductCoins(req.user._id, null, coinsUsed);
        totalCoinDiscount = coinsUsed * coinToRupeeRate;
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    // 4. Wallet Payment (Once for the whole order)
    let totalWalletUsed = 0;
    if (walletAmountUsed && walletAmountUsed > 0) {
      const wallet = await ensureWallet(req.user._id);
      if (wallet.balance < walletAmountUsed) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      const priceAfterDiscounts = totalOrderPrice - totalCouponDiscount - totalCoinDiscount;
      if (walletAmountUsed > priceAfterDiscounts) {
        return res.status(400).json({ message: 'Wallet amount exceeds payable amount' });
      }

      wallet.balance -= walletAmountUsed;
      wallet.transactions.push({
        type: 'debit',
        amount: walletAmountUsed,
        note: 'Used for bulk booking payment',
        meta: { type: 'booking_payment' }
      });
      await wallet.save();
      totalWalletUsed = walletAmountUsed;
    }

    // 5. Create Bookings
    const createdBookings = [];
    let remainingCouponDiscount = totalCouponDiscount;
    let remainingCoinDiscount = totalCoinDiscount;
    let remainingCoinsUsed = coinsUsed || 0;
    let remainingWalletUsed = totalWalletUsed;
    let remainingMembershipDiscount = totalMembershipDiscount;
    let remainingFees = platformFee + percentageFee;
    const totalFees = platformFee + percentageFee;

    for (let i = 0; i < bookings.length; i++) {
      const item = bookings[i];
      const isLast = i === bookings.length - 1;

      // Distribute discounts proportionally
      let itemCouponDiscount = 0;
      let itemCoinDiscount = 0;
      let itemCoinsUsed = 0;
      let itemWalletUsed = 0;
      let itemMembershipDiscount = 0;
      let itemFees = 0;

      if (totalOrderPrice > 0) {
        if (isLast) {
          itemCouponDiscount = remainingCouponDiscount;
          itemCoinDiscount = remainingCoinDiscount;
          itemCoinsUsed = remainingCoinsUsed;
          itemWalletUsed = remainingWalletUsed;
          itemMembershipDiscount = remainingMembershipDiscount;
        } else {
          const ratio = item.price / totalOrderPrice;
          itemCouponDiscount = Math.floor(totalCouponDiscount * ratio);
          itemCoinDiscount = Math.floor(totalCoinDiscount * ratio);
          itemCoinsUsed = Math.floor((coinsUsed || 0) * ratio);
          itemWalletUsed = Math.floor((walletAmountUsed || 0) * ratio);
          itemMembershipDiscount = Math.floor(totalMembershipDiscount * ratio);
          itemFees = Math.floor(totalFees * ratio);

          remainingCouponDiscount -= itemCouponDiscount;
          remainingCoinDiscount -= itemCoinDiscount;
          remainingCoinsUsed -= itemCoinsUsed;
          remainingWalletUsed -= itemWalletUsed;
          remainingMembershipDiscount -= itemMembershipDiscount;
          remainingFees -= itemFees;
        }
      }

      if (isLast) {
        itemFees = remainingFees;
      }

      const itemTotalPrice = item.price + itemFees;
      const finalPrice = Math.max(0, itemTotalPrice - itemCouponDiscount - itemCoinDiscount - itemMembershipDiscount);

      // Determine payment status for this item
      // If total order is fully paid by wallet, then this item is paid.
      // Or if wallet covers this item's share.
      // Simplification: If totalWalletUsed covers total payable, then all are paid.
      // But we might have partial wallet payment.
      // Let's say paymentStatus is passed as 'paid' (if online) or 'pending' (COD).
      // If wallet covers everything, we override to 'paid'.

      let itemPaymentStatus = paymentStatus || 'pending';
      const totalPayable = totalOrderPrice - totalCouponDiscount - totalCoinDiscount;
      const actualAmountPaid = amountPaid || 0;

      if (totalWalletUsed >= totalPayable && totalPayable > 0) {
        itemPaymentStatus = 'paid';
      } else if (actualAmountPaid > 0 && actualAmountPaid < totalPayable) {
        itemPaymentStatus = 'partial';
      } else if (actualAmountPaid >= totalPayable && totalPayable > 0) {
        itemPaymentStatus = 'paid';
      }

      // Distribute amountPaid proportionally for record keeping
      let itemAmountPaid = 0;
      if (actualAmountPaid > 0) {
        if (isLast) {
          itemAmountPaid = actualAmountPaid - (Math.floor(actualAmountPaid / bookings.length) * (bookings.length - 1));
        } else {
          itemAmountPaid = Math.floor(actualAmountPaid / bookings.length);
        }
      }

      const booking = new Booking({
        user: req.user._id,
        worker: item.workerId,
        category: item.category,
        service: item.service,
        description: item.description,
        bookingDate: item.bookingDate,
        bookingTime: item.bookingTime,
        address: address,
        price: item.price,
        totalPrice: itemTotalPrice,
        couponApplied: couponId,
        couponCode: actualCouponCode,
        couponDiscount: itemCouponDiscount,
        coinsUsed: itemCoinsUsed,
        coinDiscount: itemCoinDiscount,
        walletAmountUsed: itemWalletUsed,
        finalPrice,
        membershipDiscount: itemMembershipDiscount,
        membershipApplied: membershipPlanId,
        amountPaid: itemAmountPaid + itemWalletUsed,
        paymentStatus: itemPaymentStatus,
        paymentId,
        bookingType: item.bookingType,
        days: item.days,
        startDate: item.startDate,
        endDate: item.endDate,
        status: 'pending',
        platformFee: isLast ? (platformFee - (Math.floor(platformFee / bookings.length) * (bookings.length - 1))) : Math.floor(platformFee / bookings.length),
        percentageFee: isLast ? (percentageFee - (Math.floor(percentageFee / bookings.length) * (bookings.length - 1))) : Math.floor(percentageFee / bookings.length),
        distance: distance,
        isAdvancePayment: isAdvancePayment || false,
        advanceAmount: isAdvancePayment ? (isLast ? (advanceAmount - Math.floor(advanceAmount / bookings.length) * (bookings.length - 1)) : Math.floor(advanceAmount / bookings.length)) : 0
      });

      const savedBooking = await booking.save();
      createdBookings.push(savedBooking);

      // Award cashback - TODO: Implement awardCashback function
      // if (finalPrice > 0) {
      //   const cashbackEarned = await awardCashback(req.user._id, savedBooking._id, finalPrice);
      //   if (cashbackEarned) {
      //     savedBooking.cashbackEarned = cashbackEarned;
      //     await savedBooking.save();
      //   }
      // }

      // Notify Worker
      // Notify Worker if assigned
      if (item.workerId) {
        if (req.io) {
          req.io.to(item.workerId).emit('new_booking', {
            message: 'New booking request received!',
            booking: savedBooking,
          });
        }

        // Send Notification to Worker
        await createNotification({
          recipient: item.workerId,
          recipientModel: 'Worker',
          title: 'New Booking Request',
          message: `You have a new booking request for ${item.service}`,
          type: 'booking',
          data: {
            bookingId: savedBooking._id,
            screen: 'BookingDetails',
            params: JSON.stringify({ bookingId: savedBooking._id })
          }
        });
      }
    }

    // 5. Record Coupon Usage (Link to the first booking for reference)
    if (couponId && createdBookings.length > 0) {
      await CouponUsage.create({
        coupon: couponId,
        user: req.user._id,
        booking: createdBookings[0]._id, // Link to first booking
        discountAmount: totalCouponDiscount
      });
    }

    res.status(201).json(createdBookings);

  } catch (error) {
    console.error('Error creating bulk bookings:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message || 'Server error while creating bookings.' });
  }
};

// @desc    Get all bookings (with filters)
// @route   GET /api/bookings
// @access  Private (Admin/Worker/User)
export const getBookings = async (req, res) => {
  try {
    const { worker, user, status, startDate, endDate } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    let query = {};

    // Filter by worker
    if (worker) {
      query.worker = worker;
    }

    // Filter by user
    if (user) {
      query.user = user;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) query.bookingDate.$gte = new Date(startDate);
      if (endDate) query.bookingDate.$lte = new Date(endDate);
    }

    // Role-based access control
    if (req.user.role === 'worker') {
      // Workers can only see their own bookings
      query.worker = req.user._id;
    } else if (req.user.role === 'user') {
      // Users can only see their own bookings
      query.user = req.user._id;
    }
    // Admins can see all (subject to filters)

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name mobileNumber')
        .populate('worker', 'firstName lastName mobileNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query)
    ]);

    // Return with both data and bookings properties for compatibility
    const response = createPaginatedResponse(bookings, total, page, limit);
    response.data = bookings; // Add data property
    response.bookings = bookings; // Keep bookings property for backward compatibility

    res.json(response);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
};

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/my
// @access  Private (User)
export const getUserBookings = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const [bookings, total] = await Promise.all([
      Booking.find({ user: req.user._id })
        .populate('worker', 'firstName lastName mobileNumber livePhoto price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments({ user: req.user._id })
    ]);

    res.json(createPaginatedResponse(bookings, total, page, limit));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Server error while fetching user bookings.' });
  }
};

// @desc    Get all bookings for the logged-in worker
// @route   GET /api/bookings/worker/my
// @access  Private (Worker)
export const getWorkerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ worker: req.user._id }) // Assuming worker's user ID is stored in req.user._id
      .populate('user', 'name email phone') // Populate user details
      .sort({ createdAt: -1 }); // Newest first
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching worker bookings:', error);
    res.status(500).json({ message: 'Server error while fetching worker bookings.' });
  }
};

import UserCoins from '../model/UserCoins.js';

// Helper function to credit YC Coins
const creditYCCoinsToUser = async (userId, bookingId) => {
  try {
    const coinsToCredit = 5; // Fixed 5 coins
    if (coinsToCredit > 0) {
      // Ensure UserCoins record exists
      let userCoins = await UserCoins.findOne({ user: userId });
      if (!userCoins) {
        userCoins = await UserCoins.create({ user: userId, balance: 0 });
      }

      userCoins.balance += coinsToCredit;
      userCoins.totalEarned += coinsToCredit;
      userCoins.transactions.push({
        type: 'earned',
        amount: coinsToCredit,
        reason: `Earned for booking completion`,
        bookingId: bookingId,
        createdAt: new Date()
      });
      await userCoins.save();

      console.log(`Credited ${coinsToCredit} YC Coins to user ${userId} for booking ${bookingId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to credit YC Coins for user ${userId}, booking ${bookingId}:`, error);
    return false;
  }
};


// @desc    Update booking status (worker/admin)
// @route   PUT /api/bookings/:id/status
// @access  Private (Worker/Admin)
export const updateStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params; // Booking ID

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Authorization: Only the assigned worker or an admin can update status
    if (req.user.role === 'worker' && booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking status.' });
    }
    // Admin can update any booking status
    // For simplicity, assuming req.user.role is 'admin' for admin users.
    // You might need to implement a proper role-based access control (RBAC) middleware.

    // Validate status transition
    const validTransitions = {
      'pending': ['accepted', 'rejected'],
      'accepted': ['in-progress', 'cancelled'], // Worker can cancel accepted booking
      'in-progress': ['completed'],
      // Admin can override any status
    };

    if (req.user.role !== 'admin' && (!validTransitions[booking.status] || !validTransitions[booking.status].includes(status))) {
      return res.status(400).json({ message: `Invalid status transition from ${booking.status} to ${status}.` });
    }

    // Enforce payment before completion
    if (status === 'completed' && booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Cannot complete booking. Payment is pending.' });
    }

    booking.status = status;

    // Handle YC Coin reward on completion
    if (status === 'completed' && !booking.isYcCoinsCredited) {
      const credited = await creditYCCoinsToUser(booking.user, booking._id);
      if (credited) {
        booking.ycCoinsEarned = 5;
        booking.isYcCoinsCredited = true;
      }
    }

    const updatedBooking = await booking.save();

    // Notify User
    if (req.io) {
      req.io.to(booking.user.toString()).emit('booking_status_updated', {
        message: `Your booking status is now ${status}`,
        booking: updatedBooking,
      });
    }

    // Send Notification
    await createNotification({
      recipient: booking.user,
      recipientModel: 'User',
      title: 'Booking Status Updated',
      message: `Your booking status is now ${status}`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        screen: 'BookingDetail',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error while updating booking status.' });
  }
};

// @desc    Cancel a booking (User)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if worker is assigned
    if (booking.worker) {
      return res.status(400).json({ message: 'Cannot cancel booking after a worker has been assigned.' });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    const previousStatus = booking.status;
    const previousPaymentStatus = booking.paymentStatus;

    booking.status = 'cancelled';

    // Process Refund if paid
    let refundProcessed = false;
    let refundAmount = 0;

    if (previousPaymentStatus === 'paid' && (booking.amountPaid > 0 || booking.walletAmountUsed > 0)) {
      // Refund Wallet Amount
      if (booking.walletAmountUsed > 0) {
        const wallet = await ensureWallet(req.user._id);
        wallet.balance += booking.walletAmountUsed;
        wallet.transactions.push({
          type: 'credit',
          amount: booking.walletAmountUsed,
          note: `Refund for cancelled booking #${booking._id}`,
          meta: { type: 'refund', bookingId: booking._id }
        });
        await wallet.save();
        refundProcessed = true;
        refundAmount += booking.walletAmountUsed;
      }

      // Refund Online Payment (Simplify: refund to wallet if online paid?)
      // Or just mark for manual refund?
      // Let's autosave it to wallet for now if we don't have auto-refund API
      if (booking.amountPaid > 0) {
        const wallet = await ensureWallet(req.user._id);
        wallet.balance += booking.amountPaid;
        wallet.transactions.push({
          type: 'credit',
          amount: booking.amountPaid,
          note: `Refund (Online Payment) for cancelled booking #${booking._id}`,
          meta: { type: 'refund', bookingId: booking._id }
        });
        await wallet.save();
        refundProcessed = true;
        refundAmount += booking.amountPaid;
      }
    }

    const updatedBooking = await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
      refundProcessed,
      refundAmount
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error while cancelling booking.' });
  }
};

// @desc    Admin override booking status
// @route   PUT /api/bookings/:id/admin-status
// @access  Private (Admin)
export const adminOverrideStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params; // Booking ID

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Authorization: Only admin can override status
    // This assumes you have a role field in your User model and a middleware to check it.
    // For now, let's assume req.user.isAdmin is true for admin users.
    // You might need to implement a proper role-based access control (RBAC) middleware.
    if (!req.user.isAdmin) { // Assuming isAdmin field in user object
      return res.status(403).json({ message: 'Not authorized to perform this action.' });
    }

    // Validate new status
    const validStatuses = ['pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    booking.status = status;

    // Handle YC Coin reward on completion if admin sets to completed
    if (status === 'completed' && !booking.isYcCoinsCredited) {
      const credited = await creditYCCoinsToUser(booking.user, booking._id);
      if (credited) {
        booking.ycCoinsEarned = 5;
        booking.isYcCoinsCredited = true;
      }
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error admin overriding booking status:', error);
    res.status(500).json({ message: 'Server error while admin overriding booking status.' });
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (User/Worker/Admin)
export const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    console.log(`🔍 [DEBUG] getBookingById: Booking=${bookingId}, User=${req.user?._id}, Role=${req.user?.role}`);

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate('worker', 'firstName lastName mobileNumber livePhoto price');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization: Only the user who created the booking, the assigned worker, or an admin can view it
    const isUser = booking.user && booking.user._id.toString() === req.user._id.toString();
    const isWorker = booking.worker && booking.worker._id && booking.worker._id.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'superadmin', 'employee'].includes(req.user.role);

    if (!isUser && !isWorker && !isAdmin) {
      console.log(`⛔ [DEBUG] Authorization Failed!`);
      console.log(`   - Booking User: ${booking.user ? booking.user._id : 'null'}`);
      console.log(`   - Req User: ${req.user._id}`);
      return res.status(403).json({
        message: 'Not authorized to view this booking',
        debug_info: {
          bookingUser: booking.user ? booking.user._id.toString() : 'null',
          requestUser: req.user._id.toString(),
          role: req.user.role
        }
      });
    }

    res.json(booking);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Booking ID format' });
    }
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ message: 'Server error while fetching booking details' });
  }
};



// @desc    Accept a booking (Worker)
// @route   PUT /api/bookings/:id/accept
// @access  Private (Worker)
export const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name mobileNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this worker is assigned to this booking
    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this booking' });
    }

    // Check if already accepted or rejected
    if (booking.status === 'accepted') {
      return res.status(400).json({ message: 'Booking already accepted' });
    }

    if (booking.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot accept a rejected booking' });
    }

    booking.status = 'accepted';
    const updatedBooking = await booking.save();

    // Notify user via Socket.IO
    if (req.io) {
      req.io.to(booking.user._id.toString()).emit('booking_accepted', {
        message: `Your booking has been accepted!`,
        booking: updatedBooking
      });
    }

    // Send Notification
    await createNotification({
      recipient: booking.user._id,
      recipientModel: 'User',
      title: 'Booking Accepted',
      message: `Your booking has been accepted! The worker will start the job soon.`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        screen: 'BookingDetail',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    res.json({
      message: 'Booking accepted successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ message: 'Server error while accepting booking' });
  }
};

// @desc    Reject a booking (Worker)
// @route   PUT /api/bookings/:id/reject
// @access  Private (Worker)
export const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user', 'name mobileNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this worker is assigned to this booking
    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }

    // Check if already accepted or rejected
    if (booking.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot reject an accepted booking' });
    }

    if (booking.status === 'rejected') {
      return res.status(400).json({ message: 'Booking already rejected' });
    }

    // Require cancellation reason
    if (!reason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    booking.status = 'rejected';
    booking.cancellationReason = reason;
    const updatedBooking = await booking.save();

    // Notify user via Socket.IO
    if (req.io) {
      req.io.to(booking.user._id.toString()).emit('booking_rejected', {
        message: `Your booking has been rejected. Reason: ${reason}`,
        booking: updatedBooking
      });
    }

    // Send Notification
    await createNotification({
      recipient: booking.user._id,
      recipientModel: 'User',
      title: 'Booking Rejected',
      message: `Your booking has been rejected. Reason: ${reason}`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        screen: 'BookingDetail',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    res.json({ message: 'Booking rejected', booking: updatedBooking });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Server error while rejecting booking' });
  }
};

// @desc    Request OTP to start job
// @route   PUT /api/bookings/:id/request-start-otp
// @access  Private (Worker)
export const requestStartOtp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name mobileNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Booking must be accepted to start' });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    booking.startJobOTP = otp;
    booking.otpExpiresAt = otpExpiry;
    await booking.save();

    // Notify User
    if (req.io) {
      req.io.to(booking.user._id.toString()).emit('otp_generated', {
        message: `Start Job OTP: ${otp}`,
        bookingId: booking._id,
        otp: otp
      });
    }

    await createNotification({
      recipient: booking.user._id,
      recipientModel: 'User',
      title: 'Start Job OTP',
      message: `Share this OTP with the worker to start the job: ${otp}`,
      type: 'otp',
      data: { bookingId: booking._id, otp: otp }
    });

    res.json({ message: 'OTP sent to customer' });
  } catch (error) {
    console.error('Error requesting start OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Start a booking (Worker) - Requires OTP verification
// @route   PUT /api/bookings/:id/start
// @access  Private (Worker)
export const startBooking = async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this worker is assigned to this booking
    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to start this booking' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Booking must be accepted to start' });
    }

    // Verify OTP
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required to start the job' });
    }

    if (booking.startJobOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP expired
    if (new Date() > booking.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    booking.status = 'in-progress';
    booking.startJobOTP = undefined; // Clear OTP after successful verification
    booking.otpExpiresAt = undefined;
    const updatedBooking = await booking.save();

    // Notify User
    if (req.io) {
      req.io.to(booking.user.toString()).emit('booking_updated', {
        message: `Your booking #${booking._id} has started.`,
        booking: updatedBooking
      });
    }

    // Send Notification to User
    await createNotification({
      recipient: booking.user,
      recipientModel: 'User',
      title: 'Booking Started',
      message: `Your booking for ${booking.service} has started.`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        status: 'in-progress',
        screen: 'BookingDetail',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    res.json(updatedBooking);

  } catch (error) {
    console.error('Error starting booking:', error);
    res.status(500).json({ message: 'Server error while starting booking' });
  }
};

// @desc    Request OTP for job completion (Worker)
// @route   PUT /api/bookings/:id/request-completion-otp
// @access  Private (Worker)
export const requestCompletionOtp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name mobileNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this worker is assigned to this booking
    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to request OTP for this booking' });
    }

    if (booking.status !== 'in-progress') {
      return res.status(400).json({ message: 'Booking must be in-progress to request completion OTP' });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.completeJobOTP = otp;
    await booking.save();

    // Notify User via Socket.IO
    if (req.io) {
      req.io.to(booking.user._id.toString()).emit('completion_otp_generated', {
        message: `Job Completion OTP: ${otp}`,
        booking: booking,
        otp: otp
      });
    }

    // Send Notification
    await createNotification({
      recipient: booking.user._id,
      recipientModel: 'User',
      title: 'Job Completion OTP',
      message: `Worker wants to complete the job. Share this OTP to confirm: ${otp}`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        otp: otp,
        screen: 'BookingDetail',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    res.json({ message: 'OTP sent to customer' });
  } catch (error) {
    console.error('Error requesting completion OTP:', error);
    res.status(500).json({ message: 'Server error while requesting OTP' });
  }
};

// @desc    Complete a booking (Worker) - Requires OTP
// @route   PUT /api/bookings/:id/complete
// @access  Private (Worker)
export const completeBooking = async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user', 'name mobileNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this worker is assigned to this booking
    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this booking' });
    }

    if (booking.status !== 'in-progress') {
      return res.status(400).json({ message: 'Booking must be in-progress to complete' });
    }

    // Verify OTP
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required to complete the job' });
    }

    if (booking.completeJobOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Ensure payment is collected
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Payment must be collected before completing the job' });
    }

    booking.status = 'completed';
    booking.completeJobOTP = undefined; // Clear OTP
    // Payment status remains pending until collected (unless already paid)
    const updatedBooking = await booking.save();

    // Credit Worker Wallet if payment is online (i.e., held by platform)
    if (booking.paymentMethod !== 'cash') {
      try {
        let wallet = await WorkerWallet.findOne({ worker: req.user._id });
        if (!wallet) {
          wallet = new WorkerWallet({
            worker: req.user._id,
            balance: 0,
            transactions: []
          });
        }

        wallet.balance += booking.finalPrice;
        wallet.transactions.push({
          type: 'credit',
          amount: booking.finalPrice,
          description: `Earnings for ${booking.service}`,
          bookingId: booking._id,
          date: new Date()
        });

        await wallet.save();
        console.log(`Credited ₹${booking.finalPrice} to worker ${req.user._id} wallet.`);
      } catch (walletError) {
        console.error('Error crediting worker wallet:', walletError);
        // Don't fail the request, just log error
      }
    }

    // FAILSAFE: If payment is 'paid', ensure wallet is credited
    if (booking.paymentStatus === 'paid') {
      let wallet = await WorkerWallet.findOne({ worker: booking.worker });
      if (!wallet) {
        wallet = await WorkerWallet.create({ worker: booking.worker });
      }

      // Check if transaction already exists for this booking
      const transactionExists = wallet.transactions.some(
        (t) => t.bookingId && t.bookingId.toString() === booking._id.toString()
      );

      if (!transactionExists) {
        console.log(`[Failsafe] Crediting wallet for Booking #${booking._id} in completeBooking`);
        wallet.balance += booking.finalPrice;
        wallet.transactions.push({
          type: 'credit',
          amount: booking.finalPrice,
          description: `Payment for Booking #${booking._id.toString().slice(-6)}`,
          bookingId: booking._id
        });
        await wallet.save();
      }
    }

    // Notify user
    if (req.io) {
      req.io.to(booking.user._id.toString()).emit('booking_completed', {
        message: 'Your booking has been marked as completed!',
        booking: updatedBooking
      });
    }

    // Send Notification
    await createNotification({
      recipient: booking.user._id,
      recipientModel: 'User',
      title: 'Booking Completed',
      message: 'Your booking has been marked as completed. Please proceed to payment if pending.',
      type: 'booking',
      data: {
        bookingId: booking._id,
        screen: 'BookingDetail',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    res.json({ message: 'Booking completed successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ message: 'Server error while completing booking' });
  }
};

// @desc    Collect payment for a booking (Worker)
// @route   PUT /api/bookings/:id/payment
// @access  Private (Worker)
export const collectPayment = async (req, res) => {
  const { paymentMethod, paymentId } = req.body; // paymentMethod: 'cash' or 'upi'

  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name mobileNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this worker is assigned to this booking
    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to collect payment for this booking' });
    }

    if (booking.status !== 'completed' && booking.status !== 'in-progress') {
      return res.status(400).json({ message: 'Booking must be completed or in-progress to collect payment' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already collected' });
    }

    if (paymentMethod === 'cash') {
      booking.paymentStatus = 'paid';
      booking.paymentMethod = 'cash';
      booking.paymentId = `CASH-${Date.now()}`; // Generate a dummy ID for cash

      const updatedBooking = await booking.save();

      // Notify User
      if (req.io) {
        req.io.to(booking.user._id.toString()).emit('payment_collected', {
          message: `Payment of ₹${booking.finalPrice} collected via Cash.`,
          booking: updatedBooking
        });
      }

      // Send Notification to User
      await createNotification({
        recipient: booking.user._id,
        recipientModel: 'User',
        title: 'Payment Collected',
        message: `Payment of ₹${booking.finalPrice} has been collected via Cash.`,
        type: 'payment',
        data: {
          bookingId: booking._id,
          screen: 'BookingDetail',
          params: JSON.stringify({ bookingId: booking._id })
        }
      });

      // Credit Worker Wallet
      let wallet = await WorkerWallet.findOne({ worker: booking.worker });
      if (!wallet) {
        wallet = await WorkerWallet.create({ worker: booking.worker });
      }
      wallet.balance += booking.finalPrice;
      wallet.transactions.push({
        type: 'credit',
        amount: booking.finalPrice,
        description: `Payment for Booking #${booking._id.toString().slice(-6)}`,
        bookingId: booking._id
      });
      await wallet.save();

      res.json({ message: 'Payment collected successfully', booking: updatedBooking });

    } else if (paymentMethod === 'online_native') {
      // Create Razorpay Order for Native SDK
      const keyId = process.env.RAZORPAY_KEY_ID;
      console.log(`Razorpay Key ID present: ${!!keyId}, Prefix: ${keyId ? keyId.substring(0, 4) : 'None'}`);

      const options = {
        amount: Math.round(booking.finalPrice * 100),
        currency: "INR",
        receipt: `receipt_${booking._id}`,
        payment_capture: 1
      };

      try {
        const order = await razorpay.orders.create(options);

        // Save order ID to booking
        booking.paymentId = order.id;
        await booking.save();

        res.status(200).json({
          message: 'Razorpay Order Created',
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
          booking: booking
        });
      } catch (razorpayError) {
        console.error('Razorpay Order Creation Error:', razorpayError);
        res.status(500).json({ message: 'Failed to create Razorpay order', error: razorpayError });
      }

    } else if (paymentMethod === 'upi') {
      // Create Razorpay Payment Link
      const paymentLinkOptions = {
        amount: booking.finalPrice * 100,
        currency: "INR",
        accept_partial: false,
        description: `Payment for Booking #${booking._id}`,
        customer: {
          name: booking.user.name,
          contact: booking.user.phone || booking.user.mobileNumber,
          email: booking.user.email || "customer@example.com"
        },
        notify: {
          sms: true,
          email: true
        },
        reminder_enable: true,
        notes: {
          booking_id: booking._id.toString()
        },
        callback_url: "https://your-app-scheme/payment-success", // Or a web success page
        callback_method: "get"
      };

      try {
        const paymentLink = await razorpay.paymentLink.create(paymentLinkOptions);

        // Save payment link ID and URL to booking
        booking.paymentId = paymentLink.id;
        booking.paymentLink = paymentLink.short_url;
        await booking.save();

        res.status(200).json({
          message: 'Initiate UPI Payment',
          paymentLink: paymentLink.short_url,
          paymentLinkId: paymentLink.id,
          amount: booking.finalPrice * 100,
          booking: booking
        });
      } catch (razorpayError) {
        console.error('Razorpay Payment Link Error:', razorpayError);
        res.status(500).json({ message: 'Failed to create payment link', error: razorpayError });
      }
    } else {
      res.status(400).json({ message: 'Invalid payment method' });
    }

  } catch (error) {
    console.error('Error collecting payment:', error);
    res.status(500).json({ message: 'Server error while collecting payment' });
  }
};

// @desc    Verify payment status with Razorpay
// @route   PUT /api/bookings/:id/verify-payment
// @access  Private (Worker/User)
export const verifyPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.json({ message: 'Payment already verified', status: 'paid', booking });
    }

    if (!booking.paymentId) {
      return res.status(400).json({ message: 'No payment link generated for this booking' });
    }

    // Check status with Razorpay
    // Note: razorpay.paymentLink.fetch(id) fetches the link details
    const paymentLink = await razorpay.paymentLink.fetch(booking.paymentId);

    if (paymentLink.status === 'paid') {
      booking.paymentStatus = 'paid';
      booking.paymentMethod = 'upi'; // Assuming link is mostly for UPI/Online
      await booking.save();

      // Notify User
      if (req.io) {
        req.io.to(booking.user._id.toString()).emit('payment_collected', {
          message: `Payment of ₹${booking.finalPrice} verified via UPI.`,
          booking: booking
        });
      }

      // Send Notification to User
      await createNotification({
        recipient: booking.user._id,
        recipientModel: 'User',
        title: 'Payment Verified',
        message: `Payment of ₹${booking.finalPrice} has been verified via UPI.`,
        type: 'payment',
        data: {
          bookingId: booking._id,
          screen: 'BookingDetail',
          params: JSON.stringify({ bookingId: booking._id })
        }
      });

      // Credit Worker Wallet
      let wallet = await WorkerWallet.findOne({ worker: booking.worker });
      if (!wallet) {
        wallet = await WorkerWallet.create({ worker: booking.worker });
      }
      wallet.balance += booking.finalPrice;
      wallet.transactions.push({
        type: 'credit',
        amount: booking.finalPrice,
        description: `Payment for Booking #${booking._id.toString().slice(-6)}`,
        bookingId: booking._id
      });
      await wallet.save();

      return res.json({ message: 'Payment verified successfully', status: 'paid', booking });
    } else {
      return res.json({ message: 'Payment not yet completed', status: paymentLink.status, booking });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error while verifying payment' });
  }
};

// @desc    Upload work proof photos (Worker)
// @route   PUT /api/bookings/:id/work-proof
// @access  Private (Worker)
export const uploadWorkProof = async (req, res) => {
  try {
    const { photos } = req.body; // Array of photo URLs/paths
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this worker is assigned to this booking
    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload work proof for this booking' });
    }

    if (!photos || photos.length === 0) {
      return res.status(400).json({ message: 'At least one photo is required' });
    }

    booking.workProofPhotos = photos;
    const updatedBooking = await booking.save();

    res.json({
      message: 'Work proof uploaded successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error uploading work proof:', error);
    res.status(500).json({ message: 'Server error while uploading work proof' });
  }
};

// @desc    Request reschedule (Worker)
// @route   PUT /api/bookings/:id/reschedule
// @access  Private (Worker)
export const requestReschedule = async (req, res) => {
  try {
    const { requestedDate, requestedTime, reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user', 'name mobileNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this worker is assigned to this booking
    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reschedule this booking' });
    }

    if (!requestedDate || !requestedTime || !reason) {
      return res.status(400).json({ message: 'Please provide new date, time, and reason' });
    }

    booking.rescheduleRequest = {
      requestedDate: new Date(requestedDate),
      requestedTime,
      reason,
      status: 'pending',
      requestedAt: new Date()
    };

    const updatedBooking = await booking.save();

    // Notify user via Socket.IO
    if (req.io) {
      req.io.to(booking.user._id.toString()).emit('reschedule_requested', {
        message: `Worker has requested to reschedule your booking to ${requestedTime} on ${new Date(requestedDate).toLocaleDateString()}`,
        booking: updatedBooking
      });
    }

    // Send Notification
    await createNotification({
      recipient: booking.user._id,
      recipientModel: 'User',
      title: 'Reschedule Request',
      message: `Worker has requested to reschedule your booking. Reason: ${reason}`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        screen: 'BookingDetail',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    res.json({
      message: 'Reschedule request sent successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error requesting reschedule:', error);
    res.status(500).json({ message: 'Server error while requesting reschedule' });
  }
};
// @desc    Assign a worker to a booking (Admin only)
// @route   PUT /api/bookings/:id/assign
// @access  Private (Admin)
// @desc    Assign a worker to a booking (Admin only)
// @route   PUT /api/bookings/:id/assign
// @access  Private (Admin)
export const assignWorker = async (req, res) => {
  const { id } = req.params;
  const { workerId } = req.body;

  if (!workerId) {
    return res.status(400).json({ message: 'Worker ID is required' });
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Allow re-assignment if status is 'pending', 'assigned', 'rejected' OR 'confirmed'
    if (booking.status !== 'pending' && booking.status !== 'assigned' && booking.status !== 'rejected' && booking.status !== 'confirmed') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    console.log(`[AssignWorker] Assigning Booking ${id} to Worker: ${worker.firstName} (${worker._id})`);
    console.log(`[AssignWorker] Worker FCM Token: ${worker.fcmToken ? worker.fcmToken.substring(0, 15) + '...' : 'None'}`);

    // Check availability
    const bookingDateObj = new Date(booking.bookingDate);
    const startOfDay = new Date(bookingDateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDateObj.setHours(23, 59, 59, 999));

    const existingBooking = await Booking.findOne({
      worker: workerId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['assigned', 'accepted', 'in-progress'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'Worker is already booked for this date',
        bookedDate: booking.bookingDate
      });
    }

    // Capture old worker ID if re-assigning
    const oldWorkerId = booking.worker ? booking.worker.toString() : null;

    // Update Booking
    booking.worker = workerId;
    booking.status = 'assigned';

    await booking.save();

    // Notify Old Worker (if exists and different)
    if (oldWorkerId && oldWorkerId !== workerId) {
      if (req.io) {
        req.io.to(oldWorkerId).emit('booking_removed', {
          message: 'A booking has been reassigned to another worker.',
          bookingId: booking._id
        });
      }

      await createNotification({
        recipient: oldWorkerId,
        recipientModel: 'Worker',
        title: 'Job Reassigned',
        message: `The booking for ${booking.service} has been reassigned to another worker.`,
        type: 'system',
        data: { bookingId: booking._id }
      });
    }

    // Notify New Worker
    if (req.io) {
      req.io.to(workerId).emit('new_booking', {
        message: 'You have been assigned a new booking!',
        booking: booking,
      });
      // Notify User
      req.io.to(booking.user.toString()).emit('booking_updated', {
        message: `A professional has been assigned to your booking!`,
        booking: booking
      });
    }

    // Send Notification to New Worker
    await createNotification({
      recipient: workerId,
      recipientModel: 'Worker',
      title: 'New Job Assigned',
      message: `You have been assigned a new job for ${booking.service}`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        screen: 'BookingDetails',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    // Send Notification to User
    await createNotification({
      recipient: booking.user,
      recipientModel: 'User',
      title: 'Professional Assigned',
      message: `${worker.firstName} ${worker.lastName} has been assigned to your booking for ${booking.service}.`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        screen: 'BookingDetails',
        params: JSON.stringify({ bookingId: booking._id })
      }
    });

    res.json(booking);

  } catch (error) {
    console.error('Error assigning worker:', error);
    res.status(500).json({ message: 'Server error while assigning worker' });
  }
};


// @desc    Update Inspection/Extra Work Details
// @route   PUT /api/bookings/:id/inspection
// @access  Private (Worker)
export const updateInspectionDetails = async (req, res) => {
  const { inspectionDetails } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Calculate total
    let total = 0;
    if (inspectionDetails && Array.isArray(inspectionDetails)) {
      total = inspectionDetails.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    }

    booking.inspectionDetails = inspectionDetails;
    booking.inspectionTotal = total;

    // Calculate final amount to pay
    // Base logic: finalAmountToPay = (Original Final Price) + Inspection Total
    // Note: If original was already paid, this amount is just the extra. 
    // BUT user wants "Calculate Prize". 
    // Let's store the GRAND TOTAL.
    // If original price was 500 (paid), and inspection is 200. Total is 700.
    // Payment status tracks the original 500. Inspection payment status tracks the 200.

    booking.finalAmountToPay = (booking.finalPrice || 0) + total;

    await booking.save();

    res.json({
      message: 'Inspection details updated',
      booking
    });

  } catch (error) {
    console.error('Error updating inspection details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Inspection Payment (Cash/Online)
// @route   PUT /api/bookings/:id/inspection-payment
// @access  Private (Worker)
export const verifyInspectionPayment = async (req, res) => {
  const { paymentMethod, paymentId } = req.body; // 'cash' or 'online'

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.inspectionPaymentStatus === 'paid') {
      return res.status(400).json({ message: 'Inspection payment already collected' });
    }

    booking.inspectionPaymentStatus = 'paid';
    booking.inspectionPaymentMethod = paymentMethod;

    if (paymentMethod === 'online' && paymentId) {
      // Here you might verify signature if needed, or just trust the ID passed from verified frontend flow
      // For simplicity, we record it.
    }

    await booking.save();

    // Update Worker Wallet for Cash Collection?
    // If Cash, worker collects it. 
    // Usually platform deducts its commission from worker's wallet.
    // Or if online, platform credits worker.

    // For now, let's keep it simple and just mark paid.

    res.json({ message: 'Inspection payment verified', booking });

  } catch (error) {
    console.error('Error verifying inspection payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
