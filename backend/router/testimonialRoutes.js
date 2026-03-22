import express from 'express';
import {
    getTestimonials,
    getAllTestimonialsAdmin,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
} from '../controller/testimonialController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getTestimonials)
    .post(protect, admin, createTestimonial);

router.route('/admin')
    .get(protect, admin, getAllTestimonialsAdmin);

router.route('/:id')
    .put(protect, admin, updateTestimonial)
    .delete(protect, admin, deleteTestimonial);

export default router;
