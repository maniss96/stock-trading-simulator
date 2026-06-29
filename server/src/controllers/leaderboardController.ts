import { Request, Response } from 'express';
import { leaderboardService } from '../services/leaderboardService';
import { AuthRequest } from '../middleware/auth';

export class LeaderboardController {
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    const { timeframe = 'ALL_TIME', page = '1', limit = '50' } = req.query;

    const result = await leaderboardService.getLeaderboard(
      timeframe as string,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    res.json({
      success: true,
      data: result.entries,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit as string, 10)),
      },
    });
  }

  async getUserRank(req: AuthRequest, res: Response): Promise<void> {
    const rank = await leaderboardService.getUserRank(req.userId!);
    res.json({ success: true, data: { rank } });
  }
}

export const leaderboardController = new LeaderboardController();
