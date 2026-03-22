import mongoose from 'mongoose';

const CoinConfigSchema = new mongoose.Schema({
    coinToRupeeRate: {
        type: Number,
        default: 1, // 1 coin = ₹1
        min: 0.01
    },
    maxUsagePercentage: {
        type: Number,
        default: 50, // Max 50% of booking can be paid with coins
        min: 0,
        max: 100
    },
    welcomeBonus: {
        type: Number,
        default: 100 // New users get 100 coins
    },
    referralBonus: {
        type: Number,
        default: 50 // Both referrer and referee get 50 coins
    },
    cashbackPercentage: {
        type: Number,
        default: 5, // 5% cashback in coins
        min: 0,
        max: 100
    },
    coinExpiryMonths: {
        type: Number,
        default: 12 // Coins expire after 12 months
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Only one config document should exist


export default mongoose.model('CoinConfig', CoinConfigSchema);
