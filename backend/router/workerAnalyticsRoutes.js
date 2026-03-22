import express from 'express';
import { getEarningsChart, getIncentiveProgress } from '../controller/workerAnalyticsController.js';
import { protectWorker } from '../middleware/workerAuthMiddleware.js';

const router = express.Router();

// Analytics routes
router.get('/earnings', protectWorker, getEarningsChart);
router.get('/incentives', protectWorker, getIncentiveProgress);

export default router;
