import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['earned', 'spent', 'expired', 'admin-credit', 'welcome-bonus', 'referral', 'cashback'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    expiryDate: {
        type: Date // For earned coins
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserCoinsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEarned: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    transactions: [TransactionSchema]
}, {
    timestamps: true
});

// Indexes

UserCoinsSchema.index({ balance: -1 }); // For leaderboard

export default mongoose.model('UserCoins', UserCoinsSchema);
