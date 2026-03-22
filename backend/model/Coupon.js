import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null // Only for percentage type
    },
    usageLimit: {
        type: Number,
        default: null // null = unlimited
    },
    usageCount: {
        type: Number,
        default: 0
    },
    userUsageLimit: {
        type: Number,
        default: 1 // How many times one user can use this coupon
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableOn: {
        type: String,
        enum: ['all', 'first-booking', 'specific-service'],
        default: 'all'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes for faster queries

CouponSchema.index({ isActive: 1, validUntil: 1 });

export default mongoose.model('Coupon', CouponSchema);
