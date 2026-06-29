import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { nvidiaAI } from '../ai/nvidiaAI';
import { Stock, StockHistorical } from '../models/Stock';
import { Portfolio } from '../models/Portfolio';
import { User } from '../models/User';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * GET /api/ai/status
 * Check if AI service is available
 */
router.get('/status', (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      available: nvidiaAI.isAvailable(),
      model: 'minimaxai/minimax-m3',
      provider: 'NVIDIA NIM',
    },
  });
});

/**
 * GET /api/ai/analysis/:symbol
 * Get AI market analysis for a stock
 */
router.get('/analysis/:symbol', async (req: AuthRequest, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!nvidiaAI.isAvailable()) {
      res.status(503).json({
        success: false,
        error: 'AI service not configured. Set NVIDIA_API_KEY in environment.',
      });
      return;
    }

    // Get stock data
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      res.status(404).json({ success: false, error: `Stock ${symbol} not found` });
      return;
    }

    // Get historical prices
    const historical = await StockHistorical.find({ symbol: symbol.toUpperCase() })
      .sort({ date: -1 })
      .limit(60);

    const prices = historical.reverse().map((h) => h.close);

    // Calculate basic indicators for context
    const sma50 = prices.slice(-50).reduce((s, p) => s + p, 0) / Math.min(50, prices.length);
    const sma200 = prices.reduce((s, p) => s + p, 0) / prices.length;

    // Simple RSI calculation
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    const gains = changes.filter((c) => c > 0);
    const losses = changes.filter((c) => c < 0).map((c) => Math.abs(c));
    const avgGain = gains.length > 0 ? gains.reduce((s, g) => s + g, 0) / 14 : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, l) => s + l, 0) / 14 : 0;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

    // Simple MACD
    const ema12 = prices.slice(-12).reduce((s, p) => s + p, 0) / 12;
    const ema26 = prices.slice(-26).reduce((s, p) => s + p, 0) / Math.min(26, prices.length);
    const macd = ema12 - ema26;

    const analysis = await nvidiaAI.getMarketAnalysis(
      symbol.toUpperCase(),
      stock.currentPrice,
      prices,
      { rsi, macd, sma50, sma200 }
    );

    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/ai/insights/:symbol
 * Get AI trading insights
 */
router.get('/insights/:symbol', async (req: AuthRequest, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!nvidiaAI.isAvailable()) {
      res.status(503).json({
        success: false,
        error: 'AI service not configured.',
      });
      return;
    }

    const historical = await StockHistorical.find({ symbol: symbol.toUpperCase() })
      .sort({ date: -1 })
      .limit(60);

    if (historical.length < 10) {
      res.status(400).json({ success: false, error: 'Insufficient historical data' });
      return;
    }

    const reversed = historical.reverse();
    const prices = reversed.map((h) => h.close);
    const volumes = reversed.map((h) => h.volume);
    const currentPrice = prices[prices.length - 1];

    const insights = await nvidiaAI.getTradingInsights(
      symbol.toUpperCase(),
      currentPrice,
      prices,
      volumes
    );

    res.json({ success: true, data: insights });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/explain
 * Get AI explanation of a trading concept
 */
router.post('/explain', async (req: AuthRequest, res: Response) => {
  try {
    const { concept } = req.body;

    if (!concept || typeof concept !== 'string' || concept.length > 200) {
      res.status(400).json({ success: false, error: 'Provide a concept (max 200 chars)' });
      return;
    }

    if (!nvidiaAI.isAvailable()) {
      res.status(503).json({ success: false, error: 'AI service not configured.' });
      return;
    }

    const explanation = await nvidiaAI.explainTradingConcept(concept);
    res.json({ success: true, data: { concept, explanation } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/ai/portfolio-review
 * Get AI review of user's portfolio
 */
router.get('/portfolio-review', async (req: AuthRequest, res: Response) => {
  try {
    if (!nvidiaAI.isAvailable()) {
      res.status(503).json({ success: false, error: 'AI service not configured.' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const portfolio = await Portfolio.findOne({ userId: req.userId });
    if (!portfolio || portfolio.holdings.length === 0) {
      res.status(400).json({ success: false, error: 'No holdings to review' });
      return;
    }

    // Get current prices for all holdings
    const symbols = portfolio.holdings.map((h) => h.symbol);
    const stocks = await Stock.find({ symbol: { $in: symbols } });
    const priceMap = new Map(stocks.map((s) => [s.symbol, s.currentPrice]));

    const holdings = portfolio.holdings.map((h) => ({
      symbol: h.symbol,
      quantity: h.quantity,
      avgCost: h.averageCost,
      currentPrice: priceMap.get(h.symbol) || h.averageCost,
    }));

    const totalHoldingsValue = holdings.reduce((s, h) => s + h.currentPrice * h.quantity, 0);
    const totalValue = totalHoldingsValue + user.balance;

    const review = await nvidiaAI.reviewPortfolio(holdings, user.balance, totalValue);
    res.json({ success: true, data: { review, totalValue, cashBalance: user.balance } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
