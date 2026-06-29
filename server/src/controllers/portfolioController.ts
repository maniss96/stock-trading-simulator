import { Response } from 'express';
import { portfolioService } from '../services/portfolioService';
import { AuthRequest } from '../middleware/auth';

export class PortfolioController {
  async getPortfolio(req: AuthRequest, res: Response): Promise<void> {
    const summary = await portfolioService.getPortfolioSummary(req.userId!);
    res.json({ success: true, data: summary });
  }

  async getPerformance(req: AuthRequest, res: Response): Promise<void> {
    const metrics = await portfolioService.getPerformanceMetrics(req.userId!);
    res.json({ success: true, data: metrics });
  }
}

export const portfolioController = new PortfolioController();
