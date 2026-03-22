import express from 'express';
import {
  registerWorker,
  getWorkers,
  getWorkersBySubCategory,
  getWorkersByCategory,
  approveWorker,
  rejectWorker,
  getWorkerByMobileNumber,
  getWorkerStats,
  getWorkerNotifications,
  getWorkerFeedback,
  updateWorkerDetails,
  getWorkerById,
  getWorkerTickets,
  createWorkerTicket,
  getWorkerTicketById,
  addWorkerReply
} from '../controller/workerController.js';
import {
  getEarningsChart,
  getIncentiveProgress
} from '../controller/workerAnalyticsController.js';
import upload from '../middleware/fileUpload.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.route('/').get(getWorkers);
router.route('/nearby').get(getWorkers);
router.route('/register').post(upload, registerWorker);
router.route('/subcategory/:subCategoryId').get(getWorkersBySubCategory);
router.route('/category/:categoryId').get(getWorkersByCategory);
router.route('/mobile/:mobileNumber').get(getWorkerByMobileNumber);

// Protected routes - Worker
router.route('/support').get(protect, getWorkerTickets).post(protect, createWorkerTicket);
router.route('/support/:id').get(protect, getWorkerTicketById);
router.route('/support/:id/reply').post(protect, addWorkerReply);
router.route('/:id/analytics').get(protect, getEarningsChart);
router.route('/:id/incentives').get(protect, getIncentiveProgress);

// Protected routes - Worker/Admin
router.route('/:id').get(getWorkerById).put(protect, updateWorkerDetails);
router.route('/:id/approve').put(protect, admin, approveWorker);
router.route('/:id/reject').put(protect, admin, rejectWorker);
router.route('/:id/stats').get(getWorkerStats);
router.route('/:id/notifications').get(getWorkerNotifications);
router.route('/:id/feedback').get(getWorkerFeedback);

export default router;
