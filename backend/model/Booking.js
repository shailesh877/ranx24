import mongoose from 'mongoose';

const BookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Worker is now assigned later
      ref: 'Worker',
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false, // For migration/backward compatibility, maybe true for new bookings
    },
    category: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    bookingType: {
      type: String,
      enum: ['full-day', 'half-day', 'multiple-days', 'hourly'],
      default: 'full-day',
    },
    days: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingTime: {
      type: String, // e.g., "10:00 AM"
      required: true,
    },
    address: {
      name: { type: String, required: false }, // Name associated with address
      mobileNumber: { type: String, required: false },
      street: { type: String, required: true },
      city: { type: String, required: false, default: '' },
      state: { type: String, required: false, default: '' },
      zipCode: { type: String, required: false, default: '' },
      landmark: { type: String, required: false, default: '' },
      alternateNumber: { type: String, required: false, default: '' },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    travelCharge: {
      type: Number,
      default: 0
    },
    distance: {
      type: Number,
      default: 0
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    couponCode: {
      type: String
    },
    couponDiscount: {
      type: Number,
      default: 0
    },
    coinsUsed: {
      type: Number,
      default: 0
    },
    coinDiscount: {
      type: Number,
      default: 0
    },
    membershipDiscount: {
      type: Number,
      default: 0
    },
    membershipApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan'
    },
    cashbackEarned: {
      type: Number,
      default: 0
    },
    walletAmountUsed: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'wallet', 'netbanking'],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'assigned', 'accepted', 'in-progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'partial', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentId: {
      type: String,
    },
    paymentLink: {
      type: String,
    },
    // Inspection / Extra Work Details
    inspectionDetails: [{
      description: { type: String, required: true },
      price: { type: Number, required: true }
    }],
    inspectionTotal: {
      type: Number,
      default: 0
    },
    // Total Amount to be paid (Original Price + Inspection Total - Discounts)
    finalAmountToPay: {
      type: Number,
      // default: 0 // Calculated dynamically usually
    },
    inspectionPaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    inspectionPaymentMethod: {
      type: String,
      enum: ['cash', 'online'],
    },
    // For YC Coins reward tracking
    ycCoinsEarned: {
      type: Number,
      default: 0,
    },
    isYcCoinsCredited: {
      type: Boolean,
      default: false,
    },
    // Start Job OTP (sent to user when worker accepts)
    startJobOTP: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    // Completion OTP (sent to user when worker requests completion)
    completeJobOTP: {
      type: String,
    },
    // Work proof photos uploaded by worker
    workProofPhotos: [{
      type: String,
    }],
    // Cancellation/Rejection reason
    cancellationReason: {
      type: String,
    },
    // Reschedule request
    rescheduleRequest: {
      requestedDate: Date,
      requestedTime: String,
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
      },
      requestedAt: Date,
    },
    isAdvancePayment: {
      type: Boolean,
      default: false
    },
    advanceAmount: {
      type: Number,
      default: 0
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
BookingSchema.index({ user: 1, createdAt: -1 }); // User's bookings sorted by date
BookingSchema.index({ worker: 1, createdAt: -1 }); // Worker's bookings sorted by date
BookingSchema.index({ status: 1, createdAt: -1 }); // Filter by status, sort by date
BookingSchema.index({ user: 1, status: 1 }); // User's bookings by status
BookingSchema.index({ worker: 1, status: 1 }); // Worker's bookings by status
BookingSchema.index({ paymentStatus: 1 }); // Payment status lookup
BookingSchema.index({ bookingDate: 1 }); // Bookings by date

const Booking = mongoose.model('Booking', BookingSchema);

export default Booking;