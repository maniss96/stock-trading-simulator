import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/security';
import { registerValidation, loginValidation, handleValidation } from '../middleware/validation';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  registerValidation,
  handleValidation,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  loginValidation,
  handleValidation,
  authController.login
);

// POST /api/auth/refresh
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// POST /api/auth/logout-all
router.post('/logout-all', authenticate, authController.logoutAll);

// GET /api/auth/profile
router.get('/profile', authenticate, authController.getProfile);

export default router;
