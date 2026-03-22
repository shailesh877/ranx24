import mongoose from 'mongoose';

const CouponUsageSchema = new mongoose.Schema({
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    discountAmount: {
        type: Number,
        required: true
    },
    usedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for checking user usage
CouponUsageSchema.index({ coupon: 1, user: 1 });
CouponUsageSchema.index({ booking: 1 });

export default mongoose.model('CouponUsage', CouponUsageSchema);
