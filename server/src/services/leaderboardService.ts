import { User } from '../models/User';
import { PortfolioHistory } from '../models/Portfolio';
import { portfolioService } from './portfolioService';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  totalProfitLoss: number;
  profitLossPercent: number;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  score: number;
}

class LeaderboardService {
  private readonly SCORE_WEIGHTS = {
    profitLoss: 0.35,
    winRate: 0.25,
    sharpeRatio: 0.20,
    consistency: 0.10,
    totalTrades: 0.10,
  };

  /**
   * Get leaderboard rankings
   */
  async getLeaderboard(
    timeframe: string = 'ALL_TIME',
    page = 1,
    limit = 50
  ): Promise<{ entries: LeaderboardEntry[]; total: number }> {
    const minTrades = 10;
    const filter = { totalTrades: { $gte: minTrades } };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ totalProfitLoss: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('username avatar totalProfitLoss totalTrades winRate initialBalance');

    const entries: LeaderboardEntry[] = await Promise.all(
      users.map(async (user, index) => {
        const profitLossPercent = user.initialBalance > 0
          ? (user.totalProfitLoss / user.initialBalance) * 100
          : 0;

        // Calculate simplified Sharpe Ratio
        const history = await PortfolioHistory.find({ userId: user._id })
          .sort({ date: -1 })
          .limit(30);

        let sharpeRatio = 0;
        if (history.length > 1) {
          const returns = [];
          for (let i = 1; i < history.length; i++) {
            if (history[i - 1].totalValue > 0) {
              returns.push(
                (history[i].totalValue - history[i - 1].totalValue) / history[i - 1].totalValue
              );
            }
          }
          if (returns.length > 0) {
            const avg = returns.reduce((s, r) => s + r, 0) / returns.length;
            const std = Math.sqrt(
              returns.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / returns.length
            );
            sharpeRatio = std > 0 ? (avg * Math.sqrt(252)) / (std * Math.sqrt(252)) : 0;
          }
        }

        const score = this.calculateScore(
          profitLossPercent,
          user.winRate,
          sharpeRatio,
          user.totalTrades
        );

        return {
          rank: (page - 1) * limit + index + 1,
          userId: user._id.toString(),
          username: user.username,
          avatar: user.avatar,
          totalProfitLoss: user.totalProfitLoss,
          profitLossPercent,
          totalTrades: user.totalTrades,
          winRate: user.winRate,
          sharpeRatio,
          score,
        };
      })
    );

    // Sort by score
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((entry, i) => {
      entry.rank = (page - 1) * limit + i + 1;
    });

    return { entries, total };
  }

  /**
   * Get user's rank
   */
  async getUserRank(userId: string): Promise<number> {
    const { entries } = await this.getLeaderboard('ALL_TIME', 1, 1000);
    const userEntry = entries.find((e) => e.userId === userId);
    return userEntry?.rank || 0;
  }

  /**
   * Calculate composite score
   */
  private calculateScore(
    profitLossPercent: number,
    winRate: number,
    sharpeRatio: number,
    totalTrades: number
  ): number {
    // Normalize each metric to 0-100 scale
    const normalizedPL = Math.min(Math.max(profitLossPercent + 50, 0), 100);
    const normalizedWR = winRate;
    const normalizedSR = Math.min(Math.max((sharpeRatio + 2) * 25, 0), 100);
    const normalizedTrades = Math.min(totalTrades / 5, 100);

    return (
      normalizedPL * this.SCORE_WEIGHTS.profitLoss +
      normalizedWR * this.SCORE_WEIGHTS.winRate +
      normalizedSR * this.SCORE_WEIGHTS.sharpeRatio +
      normalizedTrades * this.SCORE_WEIGHTS.totalTrades +
      50 * this.SCORE_WEIGHTS.consistency
    );
  }
}

export const leaderboardService = new LeaderboardService();
