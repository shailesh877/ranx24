import express from 'express';
import {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from '../controller/serviceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

import uploadMiddleware from '../middleware/fileUpload.js';

const router = express.Router();

router.route('/')
    .get(getServices)
    .post(protect, admin, uploadMiddleware, createService);

router.route('/:id')
    .get(getServiceById)
    .put(protect, admin, uploadMiddleware, updateService)
    .delete(protect, admin, deleteService);

export default router;
