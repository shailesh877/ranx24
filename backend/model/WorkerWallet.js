import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    withdrawalRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WithdrawalRequest'
    }
});

const workerWalletSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [transactionSchema]
}, {
    timestamps: true
});

const WorkerWallet = mongoose.model('WorkerWallet', workerWalletSchema);

export default WorkerWallet;
