import express from 'express';
import { loginUser, getUserProfile, updateUserProfile } from '../controller/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/fileUpload.js';

const router = express.Router();

// Routes for users
router.post('/login', loginUser); // New login route
router.get('/profile', protect, getUserProfile); // Get user profile
router.put('/profile', protect, upload.single('profileImage'), updateUserProfile); // Update user profile

export default router;
