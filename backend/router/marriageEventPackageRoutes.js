import express from 'express';
import {
  getMarriageEventPackages,
  getMarriageEventPackageById,
} from '../controller/marriageEventPackageController.js';

const router = express.Router();

router.get('/', getMarriageEventPackages);
router.get('/:id', getMarriageEventPackageById);

export default router;
