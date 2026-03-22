

import express from 'express';
import { getCities, createCity, getCityByName, updateCityCategories, updateCity, deleteCity } from '../controller/cityController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getCities).post(protect, admin, createCity);
router.route('/name/:name').get(getCityByName);
router.route('/:id').put(protect, admin, updateCity).delete(protect, admin, deleteCity);
router.route('/:id/assign-categories').put(protect, admin, updateCityCategories);

export default router;
