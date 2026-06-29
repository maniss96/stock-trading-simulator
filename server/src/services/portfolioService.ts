import { User } from '../models/User';
import { Portfolio, PortfolioHistory } from '../models/Portfolio';
import { Stock } from '../models/Stock';
import { Transaction } from '../models/Transaction';
import { ApiError } from '../middleware/errorHandler';

interface PortfolioSummary {
  holdings: Array<{
    symbol: string;
    name: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
    dayChange: number;
    dayChangePercent: number;
  }>;
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  cashBalance: number;
  dayChange: number;
  dayChangePercent: number;
}

interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  dailyReturns: number[];
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  averageTradeReturn: number;
  bestTrade: number;
  worstTrade: number;
  portfolioHistory: Array<{ date: Date; value: number }>;
}

class PortfolioService {
  /**
   * Get full portfolio summary with real-time pricing
   */
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return {
        holdings: [],
        totalValue: user.balance,
        totalCost: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        cashBalance: user.balance,
        dayChange: 0,
        dayChangePercent: 0,
      };
    }

    // Get current prices for all holdings
    const symbols = portfolio.holdings.map((h) => h.symbol);
    const stocks = await Stock.find({ symbol: { $in: symbols } });
    const stockMap = new Map(stocks.map((s) => [s.symbol, s]));

    let totalValue = 0;
    let totalCost = 0;
    let dayChange = 0;

    const holdings = portfolio.holdings.map((holding) => {
      const stock = stockMap.get(holding.symbol);
      const currentPrice = stock?.currentPrice || holding.averageCost;
      const previousClose = stock?.previousClose || currentPrice;

      const holdingValue = currentPrice * holding.quantity;
      const holdingCost = holding.averageCost * holding.quantity;
      const profitLoss = holdingValue - holdingCost;
      const profitLossPercent = holdingCost > 0 ? (profitLoss / holdingCost) * 100 : 0;
      const holdingDayChange = (currentPrice - previousClose) * holding.quantity;
      const holdingDayChangePercent = previousClose > 0
        ? ((currentPrice - previousClose) / previousClose) * 100
        : 0;

      totalValue += holdingValue;
      totalCost += holdingCost;
      dayChange += holdingDayChange;

      return {
        symbol: holding.symbol,
        name: stock?.name || holding.symbol,
        quantity: holding.quantity,
        averageCost: holding.averageCost,
        currentPrice,
        totalValue: holdingValue,
        profitLoss,
        profitLossPercent,
        dayChange: holdingDayChange,
        dayChangePercent: holdingDayChangePercent,
      };
    });

    const totalPortfolioValue = totalValue + user.balance;
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
    const previousTotalValue = totalPortfolioValue - dayChange;
    const dayChangePercent = previousTotalValue > 0
      ? (dayChange / previousTotalValue) * 100
      : 0;

    return {
      holdings,
      totalValue: totalPortfolioValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
      cashBalance: user.balance,
      dayChange,
      dayChangePercent,
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    // Get portfolio history
    const history = await PortfolioHistory.find({ userId })
      .sort({ date: 1 })
      .limit(365);

    // Calculate daily returns
    const dailyReturns: number[] = [];
    for (let i = 1; i < history.length; i++) {
      const prevValue = history[i - 1].totalValue;
      if (prevValue > 0) {
        dailyReturns.push((history[i].totalValue - prevValue) / prevValue);
      }
    }

    // Calculate Sharpe Ratio (annualized)
    const avgReturn = dailyReturns.length > 0
      ? dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length
      : 0;
    const annualizedReturn = avgReturn * 252;
    const stdDev = dailyReturns.length > 1
      ? Math.sqrt(
          dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
            (dailyReturns.length - 1)
        ) * Math.sqrt(252)
      : 0;
    const sharpeRatio = stdDev > 0 ? (annualizedReturn - 0.02) / stdDev : 0;

    // Calculate Max Drawdown
    let maxDrawdown = 0;
    let peak = user.initialBalance;
    for (const entry of history) {
      if (entry.totalValue > peak) peak = entry.totalValue;
      const drawdown = (peak - entry.totalValue) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Get trade statistics
    const transactions = await Transaction.find({ userId, side: 'SELL' });
    const tradeReturns = transactions
      .filter((t) => t.profitLoss !== null && t.profitLoss !== undefined)
      .map((t) => t.profitLoss as number);

    const currentSummary = await this.getPortfolioSummary(userId);
    const totalReturn = currentSummary.totalValue - user.initialBalance;
    const totalReturnPercent = (totalReturn / user.initialBalance) * 100;

    return {
      totalReturn,
      totalReturnPercent,
      dailyReturns,
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
      winRate: user.winRate,
      totalTrades: user.totalTrades,
      averageTradeReturn: tradeReturns.length > 0
        ? tradeReturns.reduce((s, r) => s + r, 0) / tradeReturns.length
        : 0,
      bestTrade: tradeReturns.length > 0 ? Math.max(...tradeReturns) : 0,
      worstTrade: tradeReturns.length > 0 ? Math.min(...tradeReturns) : 0,
      portfolioHistory: history.map((h) => ({ date: h.date, value: h.totalValue })),
    };
  }

  /**
   * Save daily portfolio snapshot
   */
  async saveDailySnapshot(userId: string): Promise<void> {
    const summary = await this.getPortfolioSummary(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get previous snapshot for daily return calculation
    const lastSnapshot = await PortfolioHistory.findOne({ userId })
      .sort({ date: -1 });

    const dailyReturn = lastSnapshot
      ? (summary.totalValue - lastSnapshot.totalValue) / lastSnapshot.totalValue
      : 0;

    await PortfolioHistory.findOneAndUpdate(
      { userId, date: today },
      {
        userId,
        date: today,
        totalValue: summary.totalValue,
        cashBalance: summary.cashBalance,
        holdingsValue: summary.totalValue - summary.cashBalance,
        dailyReturn,
      },
      { upsert: true }
    );
  }
}

export const portfolioService = new PortfolioService();
