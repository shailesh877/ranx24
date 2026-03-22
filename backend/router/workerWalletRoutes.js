import express from 'express';
import { getWallet, requestPayout } from '../controller/workerWalletController.js';
import { protectWorker } from '../middleware/workerAuthMiddleware.js';

const router = express.Router();

router.use(protectWorker); // All routes protected with worker auth

router.get('/', getWallet);
router.post('/payout', requestPayout);

export default router;
