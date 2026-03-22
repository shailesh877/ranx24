// Admin Worker Routes – expose admin endpoints for managing worker services and city assignments
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    updateWorkerDetails,
    addWorkerService,
    updateWorkerService,
    removeWorkerService,
    assignCityToWorker,
    removeCityFromWorker,
} from '../controller/adminWorkerController.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect, admin);

// Update basic worker info
router.put('/:id', updateWorkerDetails);

// Service management
router.post('/:id/services', addWorkerService);
router.put('/:id/services/:serviceId', updateWorkerService);
router.delete('/:id/services/:serviceId', removeWorkerService);

// City assignment
router.post('/:id/cities', assignCityToWorker);
router.delete('/:id/cities/:cityId', removeCityFromWorker);

export default router;
