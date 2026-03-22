import CoinConfig from '../model/CoinConfig.js';
import UserCoins from '../model/UserCoins.js';
import User from '../model/User.js';
import { toBoolean } from '../utils/typeConverter.js';


// ==================== ADMIN FUNCTIONS ====================

// @desc    Get coin configuration
// @route   GET /api/coins/config
// @access  Private/Admin
const getCoinConfig = async (req, res) => {
    try {
        let config = await CoinConfig.findOne();

        // Create default config if none exists
        if (!config) {
            config = await CoinConfig.create({});
        }

        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch coin configuration', error: error.message });
    }
};

// @desc    Update coin configuration
// @route   PUT /api/coins/config
// @access  Private/Admin
const updateCoinConfig = async (req, res) => {
    try {
        let config = await CoinConfig.findOne();

        if (!config) {
            config = await CoinConfig.create(req.body);
        } else {
            const { coinToRupeeRate, maxUsagePercentage, welcomeBonus, referralBonus, cashbackPercentage, coinExpiryMonths, isActive } = req.body;

            if (coinToRupeeRate !== undefined) config.coinToRupeeRate = coinToRupeeRate;
            if (maxUsagePercentage !== undefined) config.maxUsagePercentage = maxUsagePercentage;
            if (welcomeBonus !== undefined) config.welcomeBonus = welcomeBonus;
            if (referralBonus !== undefined) config.referralBonus = referralBonus;
            if (cashbackPercentage !== undefined) config.cashbackPercentage = cashbackPercentage;
            if (coinExpiryMonths !== undefined) config.coinExpiryMonths = coinExpiryMonths;
            if (isActive !== undefined) config.isActive = toBoolean(isActive);

            await config.save();
        }

        res.status(200).json({ message: 'Configuration updated successfully', config });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update configuration', error: error.message });
    }
};

// @desc    Credit coins to specific user
// @route   POST /api/coins/credit-user
// @access  Private/Admin
const creditCoinsToUser = async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid user ID and positive amount required' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get or create user coins record
        let userCoins = await UserCoins.findOne({ user: userId });
        if (!userCoins) {
            userCoins = await UserCoins.create({ user: userId });
        }

        // Get coin config for expiry
        const config = await CoinConfig.findOne();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (config?.coinExpiryMonths || 12));

        // Add transaction and update balance
        userCoins.transactions.push({
            type: 'admin-credit',
            amount,
            reason: reason || 'Admin credit',
            expiryDate
        });

        userCoins.balance += amount;
        userCoins.totalEarned += amount;

        await userCoins.save();

        res.status(200).json({
            message: `Successfully credited ${amount} coins to ${user.name}`,
            userCoins
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to credit coins', error: error.message });
    }
};

// @desc    Credit coins to all users (bulk)
// @route   POST /api/coins/credit-all
// @access  Private/Admin
const creditCoinsToAll = async (req, res) => {
    try {
        const { amount, reason } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid positive amount required' });
        }

        // Get all users
        const users = await User.find({});

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Get coin config for expiry
        const config = await CoinConfig.findOne();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (config?.coinExpiryMonths || 12));

        let successCount = 0;
        const transaction = {
            type: 'admin-credit',
            amount,
            reason: reason || 'Bulk admin credit',
            expiryDate
        };

        // Credit to all users
        for (const user of users) {
            try {
                let userCoins = await UserCoins.findOne({ user: user._id });

                if (!userCoins) {
                    userCoins = await UserCoins.create({
                        user: user._id,
                        balance: amount,
                        totalEarned: amount,
                        transactions: [transaction]
                    });
                } else {
                    userCoins.transactions.push(transaction);
                    userCoins.balance += amount;
                    userCoins.totalEarned += amount;
                    await userCoins.save();
                }

                successCount++;
            } catch (error) {
                console.error(`Failed to credit coins to user ${user._id}:`, error);
            }
        }

        res.status(200).json({
            message: `Successfully credited ${amount} coins to ${successCount} users`,
            totalUsers: users.length,
            successCount,
            totalCoinsDistributed: amount * successCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to credit coins to all users', error: error.message });
    }
};

// @desc    Get all user coin balances
// @route   GET /api/coins/users
// @access  Private/Admin
const getAllUserCoins = async (req, res) => {
    try {
        const userCoins = await UserCoins.find()
            .populate('user', 'name email phone')
            .sort({ balance: -1 }); // Sort by balance descending

        res.status(200).json(userCoins);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user coins', error: error.message });
    }
};

// @desc    Get user transaction history
// @route   GET /api/coins/transactions/:userId
// @access  Private/Admin
const getUserTransactions = async (req, res) => {
    try {
        const userCoins = await UserCoins.findOne({ user: req.params.userId })
            .populate('user', 'name email');

        if (!userCoins) {
            return res.status(404).json({ message: 'No coin record found for this user' });
        }

        res.status(200).json(userCoins);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
};

// ==================== USER FUNCTIONS ====================

// @desc    Get my coin balance and history
// @route   GET /api/coins/my-balance
// @access  Private/User
const getMyCoins = async (req, res) => {
    try {
        let userCoins = await UserCoins.findOne({ user: req.user._id });

        if (!userCoins) {
            // Create new record with 0 balance
            userCoins = await UserCoins.create({
                user: req.user._id,
                balance: 0
            });
        }

        res.status(200).json(userCoins);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch your coins', error: error.message });
    }
};

// @desc    Calculate how many coins can be used for a booking
// @route   POST /api/coins/calculate
// @access  Private/User
const calculateCoinUsage = async (req, res) => {
    try {
        const { bookingAmount } = req.body;

        if (!bookingAmount || bookingAmount <= 0) {
            return res.status(400).json({ message: 'Valid booking amount required' });
        }

        // Get user's coins
        const userCoins = await UserCoins.findOne({ user: req.user._id });
        const userBalance = userCoins?.balance || 0;

        // Get config
        const config = await CoinConfig.findOne();
        const coinToRupeeRate = config?.coinToRupeeRate || 1;
        const maxUsagePercentage = config?.maxUsagePercentage || 50;

        // Calculate max coins that can be used
        const maxAmountFromCoins = (bookingAmount * maxUsagePercentage) / 100;
        const maxCoinsAllowed = Math.floor(maxAmountFromCoins / coinToRupeeRate);

        // Actual coins user can use
        const coinsToUse = Math.min(userBalance, maxCoinsAllowed);
        const rupeeDiscount = coinsToUse * coinToRupeeRate;

        res.status(200).json({
            userBalance,
            coinsToUse,
            rupeeDiscount,
            maxCoinsAllowed,
            maxUsagePercentage,
            coinToRupeeRate
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to calculate coin usage', error: error.message });
    }
};

// ==================== SYSTEM FUNCTIONS ====================

// @desc    Award welcome bonus (called from user registration)
// @route   POST /api/coins/welcome-bonus
// @access  Internal/System
const awardWelcomeBonus = async (userId) => {
    try {
        const config = await CoinConfig.findOne();
        const welcomeBonus = config?.welcomeBonus || 0;

        if (welcomeBonus <= 0) return;

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (config?.coinExpiryMonths || 12));

        await UserCoins.create({
            user: userId,
            balance: welcomeBonus,
            totalEarned: welcomeBonus,
            transactions: [{
                type: 'welcome-bonus',
                amount: welcomeBonus,
                reason: 'Welcome to RanX24!',
                expiryDate
            }]
        });

        console.log(`Awarded ${welcomeBonus} welcome bonus coins to user ${userId}`);
    } catch (error) {
        console.error('Failed to award welcome bonus:', error);
    }
};

// @desc    Award cashback after booking
// @route   POST /api/coins/cashback
// @access  Internal/System
const awardCashback = async (userId, bookingId, bookingAmount) => {
    try {
        const config = await CoinConfig.findOne();
        const cashbackPercentage = config?.cashbackPercentage || 0;

        if (cashbackPercentage <= 0) return;

        const cashbackCoins = Math.floor((bookingAmount * cashbackPercentage) / 100);

        if (cashbackCoins <= 0) return;

        let userCoins = await UserCoins.findOne({ user: userId });
        if (!userCoins) {
            userCoins = await UserCoins.create({ user: userId });
        }

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (config?.coinExpiryMonths || 12));

        userCoins.transactions.push({
            type: 'cashback',
            amount: cashbackCoins,
            reason: `${cashbackPercentage}% cashback on booking`,
            bookingId,
            expiryDate
        });

        userCoins.balance += cashbackCoins;
        userCoins.totalEarned += cashbackCoins;

        await userCoins.save();

        console.log(`Awarded ${cashbackCoins} cashback coins to user ${userId}`);
        return cashbackCoins;
    } catch (error) {
        console.error('Failed to award cashback:', error);
    }
};

// @desc    Deduct coins when used in booking
// @route   POST /api/coins/deduct
// @access  Internal/System
const deductCoins = async (userId, bookingId, coinsUsed) => {
    try {
        const userCoins = await UserCoins.findOne({ user: userId });

        if (!userCoins || userCoins.balance < coinsUsed) {
            throw new Error('Insufficient coin balance');
        }

        userCoins.transactions.push({
            type: 'spent',
            amount: coinsUsed,
            reason: 'Used in booking',
            bookingId
        });

        userCoins.balance -= coinsUsed;
        userCoins.totalSpent += coinsUsed;

        await userCoins.save();

        return true;
    } catch (error) {
        console.error('Failed to deduct coins:', error);
        throw error;
    }
};

export {
    // Admin functions
    getCoinConfig,
    updateCoinConfig,
    creditCoinsToUser,
    creditCoinsToAll,
    getAllUserCoins,
    getUserTransactions,

    // User functions
    getMyCoins,
    calculateCoinUsage,

    // System functions
    awardWelcomeBonus,
    awardCashback,
    deductCoins
};
