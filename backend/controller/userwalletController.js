// backend/controller/walletController.js
import Wallet from '../model/userWallet.js';
import User from '../model/User.js';
import UserCoins from '../model/UserCoins.js';

const YC_TO_INR_CONVERSION_RATE = process.env.YC_TO_INR_CONVERSION_RATE || 100; // Default 100 YC = ₹1

// helper: ensure wallet exists
export async function ensureWallet(userId) {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0, ycCoins: 0, transactions: [] });
  }
  return wallet;
}

// GET /api/wallet/me
export const getWallet = async (req, res) => {
  try {
    const wallet = await ensureWallet(req.user._id);

    // Sync with UserCoins
    let userCoins = await UserCoins.findOne({ user: req.user._id });

    // Migration: If Wallet has coins but UserCoins doesn't (or is less), and we assume Wallet was the old source of truth
    // We should move Wallet.ycCoins to UserCoins if UserCoins is empty.
    // However, safely, let's just ensure UserCoins exists and if Wallet has coins, we might want to credit them to UserCoins?
    // Better approach: If Wallet.ycCoins > 0, we treat it as legacy balance.
    // We move it to UserCoins and set Wallet.ycCoins to 0.

    if (wallet.ycCoins > 0) {
      if (!userCoins) {
        userCoins = await UserCoins.create({
          user: req.user._id,
          balance: wallet.ycCoins,
          totalEarned: wallet.ycCoins,
          transactions: [{
            type: 'admin-credit', // or 'migration'
            amount: wallet.ycCoins,
            reason: 'Migration from Wallet',
            createdAt: new Date()
          }]
        });
      } else {
        // Add to existing UserCoins
        userCoins.balance += wallet.ycCoins;
        userCoins.totalEarned += wallet.ycCoins;
        userCoins.transactions.push({
          type: 'admin-credit',
          amount: wallet.ycCoins,
          reason: 'Migration from Wallet',
          createdAt: new Date()
        });
        await userCoins.save();
      }

      // Zero out Wallet.ycCoins so we don't migrate again
      wallet.ycCoins = 0;
      await wallet.save();
    }

    // Always return the UserCoins balance as the source of truth
    const currentCoinBalance = userCoins ? userCoins.balance : 0;

    // We return the wallet object but override ycCoins for the response
    const walletResponse = wallet.toObject();
    walletResponse.ycCoins = currentCoinBalance;

    res.json(walletResponse);
  } catch (err) {
    console.error('getWallet error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/wallet/add  -> body: { amount, note }
export const addFunds = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const wallet = await ensureWallet(req.user._id);
    wallet.balance += amt;
    wallet.transactions.push({ type: 'credit', amount: amt, note: note || 'Added funds (simulated)', meta: { method: 'simulated' } });
    await wallet.save();

    res.json({ balance: wallet.balance, transactions: wallet.transactions });
  } catch (err) {
    console.error('addFunds error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/wallet/withdraw -> body: { amount, note }
// (Simulated withdrawal: deduct from wallet; in real app you'd create payout request)
export const withdrawFunds = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const wallet = await ensureWallet(req.user._id);
    if (wallet.balance < amt) return res.status(400).json({ message: 'Insufficient balance' });

    wallet.balance -= amt;
    wallet.transactions.push({ type: 'debit', amount: amt, note: note || 'Withdrawal (simulated)' });
    await wallet.save();

    res.json({ balance: wallet.balance, transactions: wallet.transactions });
  } catch (err) {
    console.error('withdrawFunds error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/wallet/transfer -> body: { toUserId, amount, note }
// Transfer from current user wallet to another user's wallet (e.g., pay worker)
// Both wallets updated atomically-ish (two writes). For stronger guarantees use transactions.
export const transferToUser = async (req, res) => {
  try {
    const { toUserId, amount, note } = req.body;
    const amt = Number(amount);
    if (!toUserId) return res.status(400).json({ message: 'Recipient required' });
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    if (toUserId === String(req.user._id)) return res.status(400).json({ message: 'Cannot transfer to yourself' });

    const senderWallet = await ensureWallet(req.user._id);
    if (senderWallet.balance < amt) return res.status(400).json({ message: 'Insufficient balance' });

    const recipientUser = await User.findById(toUserId);
    if (!recipientUser) return res.status(404).json({ message: 'Recipient user not found' });

    const recipientWallet = await ensureWallet(toUserId);

    // Deduct from sender
    senderWallet.balance -= amt;
    senderWallet.transactions.push({ type: 'transfer_out', amount: amt, note: note || `Transfer to ${toUserId}`, meta: { to: toUserId } });
    await senderWallet.save();

    // Credit recipient
    recipientWallet.balance += amt;
    recipientWallet.transactions.push({ type: 'transfer_in', amount: amt, note: note || `Transfer from ${req.user._id}`, meta: { from: req.user._id } });
    await recipientWallet.save();

    res.json({ senderBalance: senderWallet.balance, recipientBalance: recipientWallet.balance });
  } catch (err) {
    console.error('transferToUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/wallet/transactions
export const getTransactions = async (req, res) => {
  try {
    const wallet = await ensureWallet(req.user._id);
    // Optionally allow query params to paginate or filter
    res.json(wallet.transactions.slice().reverse()); // newest first
  } catch (err) {
    console.error('getTransactions error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/wallet/redeem -> body: { ycCoins }
export const redeemYCCoins = async (req, res) => {
  try {
    const { ycCoins } = req.body;
    const coinsToRedeem = Number(ycCoins);

    if (isNaN(coinsToRedeem) || coinsToRedeem <= 0) {
      return res.status(400).json({ message: 'Invalid amount of YC Coins to redeem' });
    }

    const wallet = await ensureWallet(req.user._id);
    let userCoins = await UserCoins.findOne({ user: req.user._id });

    if (!userCoins || userCoins.balance < coinsToRedeem) {
      return res.status(400).json({ message: 'Insufficient YC Coins' });
    }

    const inrEquivalent = (coinsToRedeem / YC_TO_INR_CONVERSION_RATE);

    // Deduct from UserCoins
    userCoins.balance -= coinsToRedeem;
    userCoins.totalSpent += coinsToRedeem; // Track spending? Or redeeming?
    userCoins.transactions.push({
      type: 'spent', // or 'redeemed'
      amount: coinsToRedeem,
      reason: `Redeemed for ₹${inrEquivalent}`,
      createdAt: new Date()
    });
    await userCoins.save();

    // Add to Wallet Balance
    wallet.balance += inrEquivalent;
    wallet.transactions.push({
      type: 'redeem_yc',
      amount: inrEquivalent,
      coinAmount: -coinsToRedeem,
      note: `Redeemed ${coinsToRedeem} YC Coins for ₹${inrEquivalent}`,
    });
    await wallet.save();

    res.json({
      message: 'YC Coins redeemed successfully',
      wallet: { balance: wallet.balance, ycCoins: userCoins.balance },
    });
  } catch (err) {
    console.error('redeemYCCoins error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/wallet/credit-coins -> body: { ycCoins, note }
export const creditYCCoins = async (req, res) => {
  try {
    const { ycCoins, note } = req.body;
    const coinsToCredit = Number(ycCoins);

    if (isNaN(coinsToCredit) || coinsToCredit <= 0) {
      return res.status(400).json({ message: 'Invalid amount of YC Coins to credit' });
    }

    // Update UserCoins
    let userCoins = await UserCoins.findOne({ user: req.user._id });
    if (!userCoins) {
      userCoins = await UserCoins.create({ user: req.user._id, balance: 0 });
    }

    userCoins.balance += coinsToCredit;
    userCoins.totalEarned += coinsToCredit;
    userCoins.transactions.push({
      type: 'admin-credit',
      amount: coinsToCredit,
      reason: note || 'YC Coins credited via Wallet API',
      createdAt: new Date()
    });
    await userCoins.save();

    // Also update Wallet transaction log for visibility in wallet history?
    // Maybe not needed if we want to separate concerns, but for now let's keep wallet log clean.
    const wallet = await ensureWallet(req.user._id);
    wallet.transactions.push({
      type: 'credit_yc',
      coinAmount: coinsToCredit,
      note: note || 'YC Coins credited',
    });
    await wallet.save();

    res.json({
      message: 'YC Coins credited successfully',
      wallet: { balance: wallet.balance, ycCoins: userCoins.balance },
    });
  } catch (err) {
    console.error('creditYCCoins error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
