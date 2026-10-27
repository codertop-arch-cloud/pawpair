import express from 'express';
import {
  getApplications,
  submitApplication,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getApplications);
router.post('/', submitApplication);
router.patch('/:id/status', updateApplicationStatus);

export default router;
