import express from 'express';

const router = express.Router();

/**
 * Get Razorpay public configuration
 * This endpoint allows frontend to fetch Razorpay key without hardcoding
 * Public endpoint - no authentication required
 */
router.get('/config', (req, res) => {
    res.json({
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
});

export default router;
