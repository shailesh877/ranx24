import express from 'express';
import { adminLogin, adminRegister, getAllUsers, deleteUser, createUser, getDashboardStats, getWithdrawalRequests, approveWithdrawal, rejectWithdrawal, createEmployee, getEmployees, deleteEmployee, changePassword } from '../controller/adminController.js';

const router = express.Router();

// Admin Registration Route
router.post('/register', adminRegister);

// Admin Login Route
router.post('/login', adminLogin);

import { protect, admin, staff } from '../middleware/authMiddleware.js';

// Change Password Route (Protected, Accessible by Admin/Staff)
router.put('/change-password', protect, staff, changePassword);

// Employee Management Routes (Super Admin Only)
router.post('/employees', protect, admin, createEmployee);
router.get('/employees', protect, admin, getEmployees);
router.delete('/employees/:id', protect, admin, deleteEmployee);

// Get dashboard stats (Staff access, logic inside handles data visibility)
router.get('/stats', protect, staff, getDashboardStats);

// Get all users route (Staff can view users)
router.get('/users', protect, staff, getAllUsers);

// Create user route (Staff can create users)
router.post('/users', protect, staff, createUser);

// Delete user route (Super Admin Only)
router.delete('/users/:id', protect, admin, deleteUser);

import { getFees, updateFees } from '../controller/feeController.js';

// Fee Management Routes (Super Admin Only)
router.get('/fees', protect, getFees);
router.put('/fees', protect, admin, updateFees);

// Withdrawal Management Routes (Super Admin Only)
router.get('/withdrawals', protect, admin, getWithdrawalRequests);
router.put('/withdrawals/:id/approve', protect, admin, approveWithdrawal);
router.put('/withdrawals/:id/reject', protect, admin, rejectWithdrawal);

// Payout History Route (Super Admin Only)
import { getPayoutHistory } from '../controller/adminController.js';
router.get('/payout-history', protect, admin, getPayoutHistory);

export default router;
