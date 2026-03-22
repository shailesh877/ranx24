import express from 'express';
import { reverseGeocode } from '../controller/locationController.js';

const router = express.Router();

router.get('/reverse', reverseGeocode);

export default router;
