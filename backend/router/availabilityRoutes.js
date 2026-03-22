import express from 'express';
import {
    setAvailability,
    getAvailability,
    checkWorkerAvailability,
    updateWorkingHours
} from '../controller/availabilityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - check if worker is available for a specific date
router.get('/check', checkWorkerAvailability);

// Protected routes
router.post('/set', protect, setAvailability);
router.get('/:workerId', getAvailability);
router.put('/working-hours', protect, updateWorkingHours);

export default router;
