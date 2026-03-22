import express from 'express';
const router = express.Router();
import { getCart, addItemToCart, removeItemFromCart, clearCart } from '../controller/cartController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming you have an auth middleware

router.route('/')
  .get(protect, getCart);

router.route('/add')
  .post(protect, addItemToCart);

router.route('/remove/:workerId')
  .delete(protect, removeItemFromCart);

router.route('/clear')
  .delete(protect, clearCart);

export default router;
