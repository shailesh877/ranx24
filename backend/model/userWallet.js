// backend/model/Wallet.js
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit', 'transfer_in', 'transfer_out', 'payout'], required: true },
  amount: { type: Number, required: true },
  coinAmount: { type: Number, default: 0 },
  note: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed }, // optional extra info (booking id, worker id etc)
  createdAt: { type: Date, default: Date.now }
});

const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', unique: true, sparse: true },
  balance: { type: Number, default: 0 },
  ycCoins: { type: Number, default: 0 },
  transactions: [TransactionSchema]
}, { timestamps: true });

// Index for quick lookup


export default mongoose.model('Wallet', WalletSchema);
