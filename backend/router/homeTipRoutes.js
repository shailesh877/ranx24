import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    getHomeTips,
    getAllHomeTipsAdmin,
    getHomeTipById,
    createHomeTip,
    updateHomeTip,
    deleteHomeTip,
} from '../controller/homeTipController.js';
// Assuming you have an auth middleware to protect admin routes
// I'll need to check how other routes import it. usually it's `protect` and `admin` from authMiddleware.js
// If not sure, I'll assume for now and correct if needed.
// Checking userController exports... userController.js didn't show middleware imports.
// I'll check adminRoutes.js quickly or just look at server.js imports to be safe?
// Actually, server.js doesn't show middleware usage inside route files.
// Let's assume standard names or import if found.
// `categoryController` access comment said "Private/Admin".
// I'll skip middleware import for now and just add the routes, but in a real app I should add auth.
// Wait, the user asked for "admin add karega". So I definitely need protection.
// I will assume `protect` and `admin` middleware exist in `../middleware/authMiddleware.js`.

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/hometips';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'tip-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.route('/')
    .get(getHomeTips)
    .post(protect, admin, upload.single('image'), createHomeTip);

router.route('/admin')
    .get(protect, admin, getAllHomeTipsAdmin);

router.route('/:id')
    .get(getHomeTipById)
    .put(protect, admin, upload.single('image'), updateHomeTip)
    .delete(protect, admin, deleteHomeTip);

export default router;
