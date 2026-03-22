import express from 'express';
import {
    createReview,
    getWorkerReviews,
    getUserReviews,
} from '../controller/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/worker/:workerId', getWorkerReviews);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.get('/my', getUserReviews);

export default router;
