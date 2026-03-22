import express from 'express';
import { sendOTP, verifyOTP, register, login, forgotPassword, resetPassword, updatePassword } from '../controller/authController.js';
import validate from '../middleware/validateMiddleware.js';
import { sendOtpSchema, loginSchema, registerSchema } from '../utils/validationSchemas.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Send OTP (simulated)
router.post('/send-otp', validate(sendOtpSchema), sendOTP);

// Verify OTP
router.post('/verify-otp', validate(loginSchema), verifyOTP);

// Register User
router.post('/register', validate(registerSchema), register);

// Password Login
router.post('/login', login);

// Forgot Password
router.post('/forgotpassword', forgotPassword);

// Reset Password
router.post('/resetpassword', resetPassword);

// Update Password
router.put('/updatepassword', protect, updatePassword);

export default router;