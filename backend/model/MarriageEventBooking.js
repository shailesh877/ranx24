import mongoose from 'mongoose';

const marriageEventBookingSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarriageEventPackage',
      required: true,
    },
    contract_number: {
      type: String,
      unique: true,
    },
    event_date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    advance_amount: {
      type: Number, // 15% of total_price
      default: 0,
    },
    advance_paid: {
      type: Number, // Amount actually paid so far
      default: 0,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Partial Payment Paid', 'Paid'],
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Auto-generate contract number before save
marriageEventBookingSchema.pre('save', function (next) {
  if (!this.contract_number) {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.contract_number = `EVT-${year}-${rand}`;
  }
  next();
});

const MarriageEventBooking = mongoose.model(
  'MarriageEventBooking',
  marriageEventBookingSchema,
  'marriage_event_bookings'
);

export default MarriageEventBooking;
