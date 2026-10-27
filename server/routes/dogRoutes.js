import express from 'express';
import {
  getDogs,
  getDogById,
  createDog,
  updateDog,
  deleteDog,
} from '../controllers/dogController.js';
import { requireAuth, requireShelterStaff } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDogs);
router.get('/:id', getDogById);
router.post('/', requireAuth, requireShelterStaff, createDog);
router.patch('/:id', requireAuth, requireShelterStaff, updateDog);
router.delete('/:id', requireAuth, requireShelterStaff, deleteDog);

export default router;
