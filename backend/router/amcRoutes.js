import express from 'express';
import { getAMCPlans, purchaseAMCPackage, getMyAMCPackage } from '../controller/amcController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAMCPlans);
router.get('/my-amc', protect, getMyAMCPackage);
router.post('/purchase', protect, purchaseAMCPackage);

export default router;
