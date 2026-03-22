import express from 'express';
import {
    getCoinConfig,
    updateCoinConfig,
    creditCoinsToUser,
    creditCoinsToAll,
    getAllUserCoins,
    getUserTransactions,
    getMyCoins,
    calculateCoinUsage
} from '../controller/coinsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/User routes for config (needed for checkout calculation)
router.get('/config', protect, getCoinConfig);

// Admin routes
router.put('/config', protect, admin, updateCoinConfig);
router.post('/credit-user', protect, admin, creditCoinsToUser);
router.post('/credit-all', protect, admin, creditCoinsToAll);
router.get('/users', protect, admin, getAllUserCoins);
router.get('/transactions/:userId', protect, admin, getUserTransactions);

// User routes
router.get('/my-balance', protect, getMyCoins);
router.post('/calculate', protect, calculateCoinUsage);

export default router;
