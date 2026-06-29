import { Router } from 'express';
import { portfolioController } from '../controllers/portfolioController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All portfolio routes require authentication
router.use(authenticate);

// GET /api/portfolio
router.get('/', portfolioController.getPortfolio);

// GET /api/portfolio/performance
router.get('/performance', portfolioController.getPerformance);

export default router;
