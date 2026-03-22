import express from 'express';
import { createOrder, verifyPayment } from '../controller/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All payment routes require authentication
router.use(protect);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

export default router;
