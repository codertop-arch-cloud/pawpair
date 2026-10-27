import express from 'express';
import { getSavedDogs, toggleSaveDog } from '../controllers/savedDogController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getSavedDogs);
router.post('/toggle', toggleSaveDog);

export default router;
