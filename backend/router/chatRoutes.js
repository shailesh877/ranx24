import express from 'express';
import {
    getOrCreateChat,
    sendMessage,
    getChatMessages,
    markAsRead,
    getChats,
    uploadChatMedia,
    getChatMessagesByBookingId,
} from '../controller/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/fileUpload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getChats);
router.post('/upload', upload.single('image'), uploadChatMedia);
router.post('/booking/:bookingId', getOrCreateChat);
router.post('/:chatId/message', sendMessage);
router.get('/:chatId', getChatMessages);
router.get('/booking/:bookingId/messages', getChatMessagesByBookingId);
router.patch('/:chatId/read', markAsRead);

export default router;
