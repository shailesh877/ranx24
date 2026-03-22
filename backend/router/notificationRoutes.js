import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    updateFcmToken,
    sendBroadcastNotification
} from '../controller/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Protected routes
router.put('/fcm-token', protect, updateFcmToken);
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

// Admin routes
router.post('/broadcast', protect, admin, sendBroadcastNotification);

export default router;
