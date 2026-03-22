// backend/router/walletRoutes.js
import express from 'express';
import {
  getWallet,
  addFunds,
  withdrawFunds,
  transferToUser,
  getTransactions,
  redeemYCCoins, // Import new function
  creditYCCoins, // Import new function
} from '../controller/userwalletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // all wallet routes require auth

router.get('/', getWallet);
router.post('/add', addFunds);
router.post('/withdraw', withdrawFunds);
router.post('/transfer', transferToUser);
router.get('/transactions', getTransactions);
router.post('/redeem', redeemYCCoins); // New route
router.post('/credit-coins', creditYCCoins); // New route

export default router;
