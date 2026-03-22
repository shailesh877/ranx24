import express from 'express';
import { getMembershipPlans, getMembershipPlanById, buyMembership, getMyMembership } from '../controller/membershipController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMembershipPlans);
router.get('/my-membership', protect, getMyMembership);
router.post('/buy', protect, buyMembership);
router.get('/:id', getMembershipPlanById);

export default router;
