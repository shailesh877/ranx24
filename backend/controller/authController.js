import User from "../model/User.js";
import Worker from "../model/Worker.js";
import { createToken } from '../utils/jwt.js';
import { ensureWallet } from "./userwalletController.js";
import { createOTP, verifyOTP as verifyOTPService } from '../utils/otpService.js';
import crypto from 'crypto';
import emailService from '../utils/emailService.js';

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    // Create OTP using service (handles rate limiting)
    const result = await createOTP(phone);

    res.json({
      message: "OTP sent successfully",
      otp: result.otp, // In production, remove this and send via SMS/Email
      expiresIn: result.expiresIn // seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);

    // Handle rate limit errors
    if (error.message.includes('Too many OTP requests')) {
      return res.status(429).json({ message: error.message });
    }

    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // Verify OTP using service (handles attempts and expiry)
    try {
      await verifyOTPService(phone, otp);
    } catch (otpError) {
      return res.status(400).json({ message: otpError.message });
    }

    // OTP verified successfully, now check user type

    // 1. Check if it's a Worker
    const worker = await Worker.findOne({ mobileNumber: phone });
    if (worker) {
      // Generate Token for Worker
      const token = createToken(worker._id, 'worker');

      return res.json({
        message: "Worker Login Successful",
        user: { ...worker.toObject(), role: 'worker' },
        token,
        userType: 'worker'
      });
    }

    // 2. Check if it's a User
    let user = await User.findOne({ phone });

    // If user does not exist -> Return isNewUser flag
    if (!user) {
      return res.json({ isNewUser: true, phone });
    }

    // Ensure wallet exists for existing user (idempotent)
    await ensureWallet(user._id);

    // Generate Token for User
    const token = createToken(user._id, 'user');

    res.json({
      message: "Login Successful",
      user: { ...user.toObject(), role: 'user' },
      token,
      userType: 'user'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Register User
export const register = async (req, res) => {
  try {
    const { name, phone, userType } = req.body;
    console.log('Register Request Body:', { ...req.body, password: '***' });

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and Phone are required" });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      name,
      email: req.body.email || undefined,
      phone,
      password: req.body.password, // Add password
      role: userType || 'user'
    });

    // Ensure wallet is created
    await ensureWallet(user._id);

    // Send welcome email
    try {
      if (user.email) {
        await emailService.sendWelcomeEmail(user);
      }
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Generate Token
    const token = createToken(user._id, user.role);

    res.status(201).json({
      message: "Registration Successful",
      user: { ...user.toObject(), role: user.role },
      token,
      userType: user.role
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: error.message || "Server Error", stack: error.stack });
  }
};

// Password-based Login
export const login = async (req, res) => {
  try {
    const { identifier, password, userType } = req.body; // identifier can be phone or email

    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and Password are required" });
    }

    let user;
    let role;

    // Check if it's a Worker (Workers usually login with phone)
    if (userType === 'worker') {
      user = await Worker.findOne({ mobileNumber: identifier });
      role = 'worker';
    } else {
      // Check if it's a User (Users can login with phone or email)
      user = await User.findOne({
        $or: [{ phone: identifier }, { email: identifier }]
      });
      role = 'user';
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Ensure wallet exists for user
    if (role === 'user') {
      await ensureWallet(user._id);
    }

    // Generate Token
    const token = createToken(user._id, role);

    res.json({
      message: "Login Successful",
      user: { ...user.toObject(), role },
      token,
      userType: role
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { identifier, userType } = req.body;
    let user;

    if (userType === 'worker') {
      user = await Worker.findOne({ mobileNumber: identifier });
    } else {
      user = await User.findOne({
        $or: [{ phone: identifier }, { email: identifier }]
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    let emailSent = false;
    try {
      if (user.email) {
        await emailService.sendPasswordReset(user, resetToken);
        emailSent = true;
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Rollback - remove reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        message: "Failed to send reset email. Please try again later."
      });
    }

    // Production response - no token exposed
    if (emailSent) {
      res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email. Please check your inbox."
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No email address found for this account. Please contact support."
      });
    }

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, userType } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    let user;
    const query = {
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    };

    if (userType === 'worker') {
      user = await Worker.findOne(query);
    } else {
      user = await User.findOne(query);
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // req.user is set by the protect middleware
    const userId = req.user._id;
    const userRole = req.user.role; // 'user' or 'worker' (or 'admin')

    let user;
    if (userRole === 'worker') {
      user = await Worker.findById(userId).select('+password');
    } else {
      user = await User.findById(userId).select('+password');
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
