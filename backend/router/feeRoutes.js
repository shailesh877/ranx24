import express from 'express';
import FeeConfig from '../model/FeeConfig.js';

const router = express.Router();

/**
 * Get the worker registration fee
 * Public endpoint - no authentication required
 */
router.get('/registration-fee', async (req, res) => {
    try {
        const config = await FeeConfig.getSingleton();
        res.json({
            registrationFee: config.workerRegistrationFee || 0
        });
    } catch (error) {
        console.error('Error fetching registration fee:', error);
        res.status(500).json({ message: 'Server error fetching registration fee' });
    }
});

export default router;
