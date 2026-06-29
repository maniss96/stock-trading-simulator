import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboardController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { paginationValidation, handleValidation } from '../middleware/validation';

const router = Router();

// GET /api/leaderboard
router.get('/', optionalAuth, paginationValidation, handleValidation, leaderboardController.getLeaderboard);

// GET /api/leaderboard/my-rank
router.get('/my-rank', authenticate, leaderboardController.getUserRank);

export default router;
