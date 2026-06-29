import { Stock, StockHistorical } from '../models/Stock';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Simulated stock data for development (replaces live API calls)
const SIMULATED_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.20, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.90, sector: 'Consumer Discretionary' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, sector: 'Consumer Discretionary' },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 505.75, sector: 'Communication Services' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.30, sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 198.40, sector: 'Finance' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.20, sector: 'Healthcare' },
  { symbol: 'V', name: 'Visa Inc.', price: 282.90, sector: 'Finance' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 168.50, sector: 'Consumer Staples' },
  { symbol: 'DIS', name: 'The Walt Disney Company', price: 112.30, sector: 'Communication Services' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 628.40, sector: 'Communication Services' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 172.80, sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corporation', price: 43.20, sector: 'Technology' },
];

class StockService {
  /**
   * Initialize stock data in database
   */
  async initializeStocks(): Promise<void> {
    const count = await Stock.countDocuments();
    if (count > 0) return;

    const stocks = SIMULATED_STOCKS.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      exchange: 'NASDAQ',
      sector: s.sector,
      currentPrice: s.price,
      previousClose: s.price * (1 + (Math.random() - 0.5) * 0.02),
      open: s.price * (1 + (Math.random() - 0.5) * 0.01),
      high: s.price * (1 + Math.random() * 0.03),
      low: s.price * (1 - Math.random() * 0.03),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
      marketCap: s.price * (Math.floor(Math.random() * 5000000000) + 1000000000),
      change: 0,
      changePercent: 0,
      lastUpdated: new Date(),
    }));

    // Calculate change values
    stocks.forEach((stock) => {
      stock.change = stock.currentPrice - stock.previousClose;
      stock.changePercent = (stock.change / stock.previousClose) * 100;
    });

    await Stock.insertMany(stocks);
    logger.info('Stock data initialized');

    // Generate historical data
    await this.generateHistoricalData();
  }

  /**
   * Generate 90 days of historical data for all stocks
   */
  private async generateHistoricalData(): Promise<void> {
    const historicalCount = await StockHistorical.countDocuments();
    if (historicalCount > 0) return;

    const historicalData = [];
    const now = new Date();

    for (const stock of SIMULATED_STOCKS) {
      let price = stock.price;

      for (let i = 90; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const volatility = 0.02;
        const change = (Math.random() - 0.48) * volatility * price;
        price = Math.max(1, price + change);

        const dayHigh = price * (1 + Math.random() * 0.02);
        const dayLow = price * (1 - Math.random() * 0.02);

        historicalData.push({
          symbol: stock.symbol,
          date,
          open: price * (1 + (Math.random() - 0.5) * 0.01),
          high: dayHigh,
          low: dayLow,
          close: price,
          volume: Math.floor(Math.random() * 50000000) + 5000000,
          adjustedClose: price,
        });
      }
    }

    await StockHistorical.insertMany(historicalData);
    logger.info(`Generated ${historicalData.length} historical data points`);
  }

  /**
   * Get all stocks
   */
  async getAllStocks(): Promise<typeof Stock extends { new (): infer T } ? T[] : never> {
    return Stock.find().sort({ symbol: 1 }) as any;
  }

  /**
   * Get stock by symbol
   */
  async getStockBySymbol(symbol: string) {
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) throw new ApiError(404, `Stock ${symbol} not found`);
    return stock;
  }

  /**
   * Get historical data for a stock
   */
  async getHistoricalData(symbol: string, days = 90) {
    const data = await StockHistorical.find({
      symbol: symbol.toUpperCase(),
    })
      .sort({ date: -1 })
      .limit(days);

    return data.reverse();
  }

  /**
   * Simulate price updates (for development)
   */
  async simulatePriceUpdates(): Promise<void> {
    const stocks = await Stock.find();

    for (const stock of stocks) {
      const volatility = 0.005; // 0.5% max change per update
      const change = (Math.random() - 0.48) * volatility * stock.currentPrice;
      const newPrice = Math.max(0.01, stock.currentPrice + change);

      stock.currentPrice = parseFloat(newPrice.toFixed(2));
      stock.change = parseFloat((stock.currentPrice - stock.previousClose).toFixed(2));
      stock.changePercent = parseFloat(
        ((stock.change / stock.previousClose) * 100).toFixed(2)
      );
      stock.high = Math.max(stock.high, stock.currentPrice);
      stock.low = Math.min(stock.low, stock.currentPrice);
      stock.lastUpdated = new Date();

      await stock.save();
    }
  }

  /**
   * Search stocks by name or symbol
   */
  async searchStocks(query: string) {
    const regex = new RegExp(query, 'i');
    return Stock.find({
      $or: [
        { symbol: regex },
        { name: regex },
      ],
    }).limit(10);
  }
}

export const stockService = new StockService();
