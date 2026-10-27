import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';
import { requireAuth, requireShelterStaff } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', requireAuth, requireShelterStaff, upload.single('file'), uploadMedia);

export default router;
