import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    addBanner,
    getBanners,
    getActiveBanners,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
} from '../controller/bannerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/banners';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for banner image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
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

// Public routes
router.get('/active/:page', getActiveBanners);

// Admin routes
router.post('/', protect, admin, upload.single('image'), addBanner);
router.get('/', protect, admin, getBanners);
router.put('/:id', protect, admin, upload.single('image'), updateBanner);
router.delete('/:id', protect, admin, deleteBanner);
router.patch('/:id/toggle', protect, admin, toggleBannerStatus);

export default router;
