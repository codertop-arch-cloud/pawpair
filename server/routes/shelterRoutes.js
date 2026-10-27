import express from 'express';
import {
  getShelters,
  getShelterById,
  updateShelter,
} from '../controllers/shelterController.js';
import { requireAuth, requireShelterStaff } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getShelters);
router.get('/:id', getShelterById);
router.patch('/:id', requireAuth, requireShelterStaff, updateShelter);

export default router;
