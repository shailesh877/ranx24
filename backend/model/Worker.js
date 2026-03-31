import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const workerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
  livePhoto: {
    type: String, // URL to the uploaded image
    required: true,
  },
  aadhaarNumber: { // New
    type: String,
  },
  aadhaarFront: { // New
    type: String, // URL to the uploaded image
  },
  aadhaarBack: { // New
    type: String, // URL to the uploaded image
  },
  panNumber: { // New
    type: String,
  },
  panCard: { // New
    type: String, // URL to the uploaded image
  },
  categories: [
    {
      type: String,
    },
  ],
  services: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'unavailable', 'inactive'],
    default: 'pending',
  },
  workerType: {
    type: String,
    enum: ['premium', 'standard', 'basic'],
    default: 'standard',
  },
  // Service-based pricing (new system)
  servicePricing: [{
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory'
    },
    categoryName: {
      type: String
    },
    serviceName: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Cities where worker can work (assigned by admin)
  assignedCities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City'
  }],
  // Portfolio photos for showcasing work
  portfolioPhotos: [{
    type: String, // URLs to portfolio images
  }],
  // Default price (for backward compatibility)
  price: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  fcmToken: {
    type: String,
    default: null
  },
  // Availability management
  isAvailable: {
    type: Boolean,
    default: true
  },
  workingHours: {
    monday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    friday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } }
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Payout Details
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankName: { type: String, default: '' }
  },
  upiId: {
    type: String,
    default: ''
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
  toObject: { virtuals: true }, // Ensure virtuals are included when converting to object
});

workerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

workerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

workerSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Add 2dsphere index for geospatial queries
workerSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
workerSchema.index({ status: 1, averageRating: -1 }); // Filter by status, sort by rating
workerSchema.index({ city: 1, status: 1 }); // Filter by city and status
workerSchema.index({ categories: 1, status: 1 }); // Filter by category and status
workerSchema.index({ services: 1, status: 1 }); // Filter by service and status

// Text index for search functionality
workerSchema.index({
  firstName: 'text',
  lastName: 'text',
  city: 'text',
  categories: 'text',
  services: 'text'
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    services: 5,
    categories: 3,
    city: 1
  },
  name: 'worker_text_search'
});

// Virtual for full name
workerSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for profile picture (using livePhoto)
workerSchema.virtual('profilePic').get(function () {
  return this.livePhoto;
});

const Worker = mongoose.model('Worker', workerSchema);

export default Worker;
