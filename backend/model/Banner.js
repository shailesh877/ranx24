import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['slider', 'sponsor', 'advertisement'],
        default: 'slider'
    },
    displayPages: [{
        type: String,
        enum: ['landing', 'worker-dashboard', 'user-dashboard', 'all']
    }],
    platform: {
        type: String,
        enum: ['user-app', 'worker-app', 'website', 'all'],
        default: 'all',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
BannerSchema.index({ isActive: 1, displayOrder: 1 });
BannerSchema.index({ displayPages: 1 });
BannerSchema.index({ platform: 1 });

export default mongoose.model('Banner', BannerSchema);
