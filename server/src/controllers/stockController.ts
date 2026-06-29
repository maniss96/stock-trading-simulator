import { Request, Response } from 'express';
import { stockService } from '../services/stockService';
import { predictionEngine } from '../ai/predictionEngine';
import { Prediction } from '../models/Prediction';

export class StockController {
  async getAllStocks(_req: Request, res: Response): Promise<void> {
    const stocks = await stockService.getAllStocks();
    res.json({ success: true, data: stocks });
  }

  async getStock(req: Request, res: Response): Promise<void> {
    const { symbol } = req.params;
    const stock = await stockService.getStockBySymbol(symbol);
    res.json({ success: true, data: stock });
  }

  async getHistoricalData(req: Request, res: Response): Promise<void> {
    const { symbol } = req.params;
    const { days = '90' } = req.query;
    const data = await stockService.getHistoricalData(symbol, parseInt(days as string, 10));
    res.json({ success: true, data });
  }

  async searchStocks(req: Request, res: Response): Promise<void> {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, error: 'Search query required' });
      return;
    }
    const stocks = await stockService.searchStocks(q);
    res.json({ success: true, data: stocks });
  }

  async getPrediction(req: Request, res: Response): Promise<void> {
    const { symbol } = req.params;
    const { timeframe = '1D' } = req.query;

    // Check for cached prediction
    let prediction = await Prediction.findOne({
      symbol: symbol.toUpperCase(),
      timeframe,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!prediction) {
      // Generate new prediction
      const result = await predictionEngine.generatePrediction(
        symbol.toUpperCase(),
        timeframe as '1D' | '1W' | '1M' | '3M'
      );
      res.json({ success: true, data: result });
      return;
    }

    res.json({ success: true, data: prediction });
  }

  async getAllPredictions(req: Request, res: Response): Promise<void> {
    const { timeframe = '1D' } = req.query;
    const predictions = await Prediction.find({
      timeframe,
      expiresAt: { $gt: new Date() },
    }).sort({ confidence: -1 });

    res.json({ success: true, data: predictions });
  }
}

export const stockController = new StockController();
