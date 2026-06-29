import { Router } from 'express';
import authRoutes from './authRoutes';
import stockRoutes from './stockRoutes';
import tradingRoutes from './tradingRoutes';
import portfolioRoutes from './portfolioRoutes';
import leaderboardRoutes from './leaderboardRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stocks', stockRoutes);
router.use('/trading', tradingRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/leaderboard', leaderboardRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
