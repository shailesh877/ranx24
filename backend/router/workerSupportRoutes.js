import express from 'express';
import {
    createWorkerTicket,
    getWorkerTickets,
    getWorkerTicketById,
    addWorkerReply,
    uploadPortfolioPhoto,
    deletePortfolioPhoto
} from '../controller/workerSupportController.js';
import { protectWorker } from '../middleware/workerAuthMiddleware.js';

const router = express.Router();

// Support ticket routes
router.post('/tickets', protectWorker, createWorkerTicket);
router.get('/tickets', protectWorker, getWorkerTickets);
router.get('/tickets/:id', protectWorker, getWorkerTicketById);
router.post('/tickets/:id/reply', protectWorker, addWorkerReply);

// Portfolio routes
router.post('/portfolio', protectWorker, uploadPortfolioPhoto);
router.delete('/portfolio/:photoUrl', protectWorker, deletePortfolioPhoto);

export default router;
