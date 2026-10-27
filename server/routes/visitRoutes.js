import express from 'express';
import {
  getVisits,
  getVisitById,
  createVisit,
  joinVisit,
  leaveVisit,
  getVisitParticipants,
  getUserVisitStatus,
  getMyRegistrations,
  cancelVisit,
} from '../controllers/visitController.js';
import { requireAuth, requireShelterStaff } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVisits);
router.get('/my-registrations', requireAuth, getMyRegistrations);
router.get('/:id', getVisitById);

// Protected routes
router.use(requireAuth);
router.post('/', requireShelterStaff, createVisit);
router.post('/:id/join', joinVisit);
router.post('/:id/leave', leaveVisit);
router.get('/:id/status', getUserVisitStatus);
router.get('/:id/participants', requireShelterStaff, getVisitParticipants);
router.patch('/:id/cancel', requireShelterStaff, cancelVisit);

export default router;
