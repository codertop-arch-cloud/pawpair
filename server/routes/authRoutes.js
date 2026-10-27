import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  demoSwitch,
  getDemoUsers,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/demo-switch', demoSwitch);
router.get('/demo-users', getDemoUsers);

export default router;
