import mongoose from 'mongoose';

const feeConfigSchema = new mongoose.Schema({
    platformFee: {
        type: Number,
        default: 0,
        min: 0
    },
    percentageCharge: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure only one config document exists
feeConfigSchema.statics.getSingleton = async function () {
    const config = await this.findOne();
    if (config) return config;
    return await this.create({ platformFee: 0, percentageCharge: 0 });
};

const FeeConfig = mongoose.model('FeeConfig', feeConfigSchema);

export default FeeConfig;
