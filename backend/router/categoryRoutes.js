import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategories,
} from '../controller/categoryController.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/categories';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for category image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
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

// Routes for categories
router.route('/').get(getCategories).post(upload.single('image'), createCategory);
router.route('/:id').get(getCategoryById).put(upload.single('image'), updateCategory).delete(deleteCategory);

// Routes for sub-categories
router.route('/:id/subcategories').get(getSubCategories).post(upload.single('image'), createSubCategory);
router.route('/:id/subcategories/:subId').put(upload.single('image'), updateSubCategory).delete(deleteSubCategory);

export default router;

