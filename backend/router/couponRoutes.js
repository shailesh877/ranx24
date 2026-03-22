import express from 'express';
import {
    createCoupon,
    getAllCoupons,
    getCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getCouponStats
} from '../controller/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/', protect, admin, createCoupon);
router.get('/', protect, admin, getAllCoupons);
router.get('/stats/:id', protect, admin, getCouponStats);
router.get('/:id', protect, admin, getCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);
router.patch('/:id/toggle', protect, admin, toggleCouponStatus);

// User routes
router.post('/validate', protect, validateCoupon);

export default router;
