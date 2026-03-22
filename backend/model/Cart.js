import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: false,
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
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  bookingType: {
    type: String,
    enum: ['full-day', 'half-day', 'multiple-days'],
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
  date: {
    type: String
  },
  time: {
    type: String
  },
  address: {
    type: mongoose.Schema.Types.Mixed, // Can be string or object
  },
  isPendingDetails: {
    type: Boolean,
    default: false
  }
});

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

// ⭐⭐ MOST IMPORTANT FIX ⭐⭐
const Cart = mongoose.model("Cart", CartSchema);

export default Cart;
