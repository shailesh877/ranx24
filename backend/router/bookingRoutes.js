import express from 'express';
import {
  createBooking,
  createBulkBookings,
  getBookings,
  getBookingById,
  getUserBookings,
  getWorkerBookings,
  requestReschedule,
  acceptBooking,
  startBooking,
  completeBooking,
  rejectBooking,
  uploadWorkProof,
  collectPayment,
  verifyPaymentStatus,
  getBookingsByQuery,
  requestCompletionOtp,
  requestStartOtp,
  assignWorker,
  cancelBooking,
  updateInspectionDetails,
  verifyInspectionPayment,
} from '../controller/bookingController.js';

import { protect, admin, staff } from '../middleware/authMiddleware.js';
import { protectWorker } from '../middleware/workerAuthMiddleware.js';

const router = express.Router();

// Admin Routes (Accessible by Staff)
router.get('/admin/all', protect, staff, getBookings);

// User Routes
router.post('/', protect, createBooking);
router.post('/bulk', protect, createBulkBookings);
router.get('/my', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/assign', protect, staff, assignWorker);
router.put('/:id/cancel', protect, cancelBooking);

// Worker Routes
router.get('/', protectWorker, getBookingsByQuery);
router.get('/worker/my', protectWorker, getWorkerBookings);
router.put('/:id/reschedule', protectWorker, requestReschedule);
router.put('/:id/accept', protectWorker, acceptBooking);
router.put('/:id/request-start-otp', protectWorker, requestStartOtp);
router.put('/:id/start', protectWorker, startBooking);
router.put('/:id/complete', protectWorker, completeBooking);
router.put('/:id/reject', protectWorker, rejectBooking);
router.put('/:id/work-proof', protectWorker, uploadWorkProof);
router.put('/:id/payment', protectWorker, collectPayment);
router.put('/:id/verify-payment', protectWorker, verifyPaymentStatus);
router.put('/:id/request-completion-otp', protectWorker, requestCompletionOtp);
router.put('/:id/inspection', protectWorker, updateInspectionDetails);
router.put('/:id/inspection-payment', protectWorker, verifyInspectionPayment);

export default router;
