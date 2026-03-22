import express from 'express';
import {
    createTicket,
    getUserTickets,
    getAllTickets,
    addMessage,
    updateTicketStatus,
    markAsRead,
} from '../controller/supportController.js';
import { protect, staff } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { supportTicketSchema } from '../utils/validationSchemas.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User/Worker routes
router.post('/', validate(supportTicketSchema), createTicket);
router.get('/my', getUserTickets);
router.post('/:id/message', addMessage);

// Admin routes (Accessible by Staff)
router.get('/admin/all', staff, getAllTickets);
router.patch('/:id/status', staff, updateTicketStatus);
router.patch('/:id/read', staff, markAsRead);

export default router;
