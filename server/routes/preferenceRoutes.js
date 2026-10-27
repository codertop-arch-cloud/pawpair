import express from 'express';
import { getPreferences, savePreferences } from '../controllers/preferenceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getPreferences);
router.put('/', savePreferences);

export default router;
