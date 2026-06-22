import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createMarriageEventBooking,
  confirmAdvancePayment,
  getMyMarriageEventBookings,
  checkDateAvailability,
  getMarriageEventBookingById,
} from '../controller/marriageEventBookingController.js';

const router = express.Router();

// Public — check date availability
router.get('/check-date', checkDateAvailability);

// Protected routes
router.use(protect);
router.post('/', createMarriageEventBooking);
router.post('/:id/pay-advance', confirmAdvancePayment);
router.get('/my', getMyMarriageEventBookings);
router.get('/:id', getMarriageEventBookingById);

export default router;

