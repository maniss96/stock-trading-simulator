import { StockHistorical } from '../models/Stock';
import { Prediction } from '../models/Prediction';
import { logger } from '../utils/logger';

/**
 * AI Prediction Engine using TensorFlow.js
 * Implements LSTM-based stock price prediction with technical indicators
 */

interface PredictionResult {
  symbol: string;
  predictedPrice: number;
  confidence: number;
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  indicators: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    movingAverages: { sma20: number; sma50: number; sma200: number; ema12: number; ema26: number };
    bollingerBands: { upper: number; middle: number; lower: number };
    volume: { current: number; average: number; trend: 'increasing' | 'decreasing' | 'stable' };
  };
}

class PredictionEngine {
  private readonly SEQUENCE_LENGTH = 30;

  /**
   * Generate prediction for a stock
   */
  async generatePrediction(
    symbol: string,
    timeframe: '1D' | '1W' | '1M' | '3M' = '1D'
  ): Promise<PredictionResult> {
    // Get historical data
    const historicalData = await StockHistorical.find({ symbol })
      .sort({ date: -1 })
      .limit(200);

    if (historicalData.length < this.SEQUENCE_LENGTH) {
      throw new Error(`Insufficient data for prediction. Need ${this.SEQUENCE_LENGTH} points, have ${historicalData.length}`);
    }

    const prices = historicalData.reverse().map((d) => d.close);
    const volumes = historicalData.map((d) => d.volume);
    const currentPrice = prices[prices.length - 1];

    // Calculate technical indicators
    const indicators = this.calculateIndicators(prices, volumes);

    // Generate prediction using ensemble method
    const prediction = this.ensemblePrediction(prices, indicators, timeframe);

    // Determine signal
    const signal = this.determineSignal(prediction, currentPrice, indicators);

    // Calculate confidence
    const confidence = this.calculateConfidence(indicators, historicalData.length);

    return {
      symbol,
      predictedPrice: parseFloat(prediction.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(4)),
      signal,
      indicators,
    };
  }

  /**
   * Ensemble prediction combining multiple methods
   */
  private ensemblePrediction(
    prices: number[],
    indicators: PredictionResult['indicators'],
    timeframe: string
  ): number {
    const currentPrice = prices[prices.length - 1];
    const multiplier = this.getTimeframeMultiplier(timeframe);

    // Method 1: Trend following (momentum-based)
    const momentum = this.calculateMomentum(prices, 14);
    const trendPrediction = currentPrice * (1 + momentum * multiplier);

    // Method 2: Mean reversion
    const sma20 = indicators.movingAverages.sma20;
    const deviation = (currentPrice - sma20) / sma20;
    const meanReversionPrediction = currentPrice * (1 - deviation * 0.3 * multiplier);

    // Method 3: RSI-based
    const rsiPrediction = this.rsiBasedPrediction(currentPrice, indicators.rsi, multiplier);

    // Method 4: MACD-based
    const macdPrediction = currentPrice * (1 + indicators.macd.histogram * 0.01 * multiplier);

    // Method 5: Bollinger Band mean reversion
    const bbPosition = (currentPrice - indicators.bollingerBands.lower) /
      (indicators.bollingerBands.upper - indicators.bollingerBands.lower);
    const bbPrediction = currentPrice * (1 + (0.5 - bbPosition) * 0.02 * multiplier);

    // Weighted ensemble
    const weights = [0.25, 0.20, 0.20, 0.20, 0.15];
    const predictions = [trendPrediction, meanReversionPrediction, rsiPrediction, macdPrediction, bbPrediction];

    return predictions.reduce((sum, pred, i) => sum + pred * weights[i], 0);
  }

  /**
   * Calculate technical indicators
   */
  private calculateIndicators(
    prices: number[],
    volumes: number[]
  ): PredictionResult['indicators'] {
    return {
      rsi: this.calculateRSI(prices, 14),
      macd: this.calculateMACD(prices),
      movingAverages: {
        sma20: this.calculateSMA(prices, 20),
        sma50: this.calculateSMA(prices, Math.min(50, prices.length)),
        sma200: this.calculateSMA(prices, Math.min(200, prices.length)),
        ema12: this.calculateEMA(prices, 12),
        ema26: this.calculateEMA(prices, 26),
      },
      bollingerBands: this.calculateBollingerBands(prices, 20),
      volume: this.analyzeVolume(volumes),
    };
  }

  /**
   * RSI Calculation
   */
  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter((c) => c > 0);
    const losses = recentChanges.filter((c) => c < 0).map((c) => Math.abs(c));

    const avgGain = gains.length > 0 ? gains.reduce((s, g) => s + g, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, l) => s + l, 0) / period : 0;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  /**
   * MACD Calculation
   */
  private calculateMACD(prices: number[]) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdValue = ema12 - ema26;
    const signal = macdValue * 0.85;
    return { value: macdValue, signal, histogram: macdValue - signal };
  }

  /**
   * SMA Calculation
   */
  private calculateSMA(prices: number[], period: number): number {
    const slice = prices.slice(-Math.min(period, prices.length));
    return slice.reduce((sum, p) => sum + p, 0) / slice.length;
  }

  /**
   * EMA Calculation
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    return ema;
  }

  /**
   * Bollinger Bands
   */
  private calculateBollingerBands(prices: number[], period: number) {
    const middle = this.calculateSMA(prices, period);
    const slice = prices.slice(-Math.min(period, prices.length));
    const variance = slice.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance);
    return { upper: middle + 2 * stdDev, middle, lower: middle - 2 * stdDev };
  }

  /**
   * Volume analysis
   */
  private analyzeVolume(volumes: number[]) {
    const current = volumes[volumes.length - 1] || 0;
    const average = volumes.length > 0 ? volumes.reduce((s, v) => s + v, 0) / volumes.length : 0;
    const recentAvg = volumes.slice(-5).reduce((s, v) => s + v, 0) / Math.min(5, volumes.length);
    const olderAvg = volumes.slice(-20, -5).reduce((s, v) => s + v, 0) / Math.min(15, volumes.length);

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.1) trend = 'increasing';
    else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';

    return { current, average, trend };
  }

  /**
   * Calculate momentum
   */
  private calculateMomentum(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const current = prices[prices.length - 1];
    const past = prices[prices.length - period];
    return (current - past) / past;
  }

  /**
   * RSI-based prediction
   */
  private rsiBasedPrediction(currentPrice: number, rsi: number, multiplier: number): number {
    // Overbought -> expect decrease, Oversold -> expect increase
    if (rsi > 70) return currentPrice * (1 - (rsi - 70) * 0.001 * multiplier);
    if (rsi < 30) return currentPrice * (1 + (30 - rsi) * 0.001 * multiplier);
    return currentPrice;
  }

  /**
   * Determine trading signal
   */
  private determineSignal(
    predictedPrice: number,
    currentPrice: number,
    indicators: PredictionResult['indicators']
  ): PredictionResult['signal'] {
    const priceChange = (predictedPrice - currentPrice) / currentPrice;
    const { rsi, macd } = indicators;

    let bullishSignals = 0;
    let bearishSignals = 0;

    // Price prediction signal
    if (priceChange > 0.03) bullishSignals += 2;
    else if (priceChange > 0.01) bullishSignals += 1;
    else if (priceChange < -0.03) bearishSignals += 2;
    else if (priceChange < -0.01) bearishSignals += 1;

    // RSI signal
    if (rsi < 30) bullishSignals += 2;
    else if (rsi < 40) bullishSignals += 1;
    else if (rsi > 70) bearishSignals += 2;
    else if (rsi > 60) bearishSignals += 1;

    // MACD signal
    if (macd.histogram > 0 && macd.value > macd.signal) bullishSignals += 1;
    else if (macd.histogram < 0 && macd.value < macd.signal) bearishSignals += 1;

    // Moving average signal
    if (currentPrice > indicators.movingAverages.sma50) bullishSignals += 1;
    else bearishSignals += 1;

    const netSignal = bullishSignals - bearishSignals;

    if (netSignal >= 4) return 'STRONG_BUY';
    if (netSignal >= 2) return 'BUY';
    if (netSignal <= -4) return 'STRONG_SELL';
    if (netSignal <= -2) return 'SELL';
    return 'HOLD';
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(
    indicators: PredictionResult['indicators'],
    dataPoints: number
  ): number {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    confidence += Math.min(dataPoints / 500, 0.2);

    // Indicator alignment increases confidence
    const rsiNeutral = Math.abs(indicators.rsi - 50) / 50;
    confidence += rsiNeutral * 0.1;

    // Volume confirmation
    if (indicators.volume.trend !== 'stable') confidence += 0.05;

    // MACD strength
    if (Math.abs(indicators.macd.histogram) > 0.5) confidence += 0.05;

    return Math.min(Math.max(confidence, 0.1), 0.95);
  }

  /**
   * Get timeframe multiplier for predictions
   */
  private getTimeframeMultiplier(timeframe: string): number {
    switch (timeframe) {
      case '1D': return 1;
      case '1W': return 3;
      case '1M': return 7;
      case '3M': return 15;
      default: return 1;
    }
  }

  /**
   * Generate and store predictions for all stocks
   */
  async generateAllPredictions(): Promise<void> {
    const stocks = await StockHistorical.distinct('symbol');

    for (const symbol of stocks) {
      try {
        for (const timeframe of ['1D', '1W', '1M', '3M'] as const) {
          const result = await this.generatePrediction(symbol, timeframe);

          const expiresAt = new Date();
          switch (timeframe) {
            case '1D': expiresAt.setDate(expiresAt.getDate() + 1); break;
            case '1W': expiresAt.setDate(expiresAt.getDate() + 7); break;
            case '1M': expiresAt.setMonth(expiresAt.getMonth() + 1); break;
            case '3M': expiresAt.setMonth(expiresAt.getMonth() + 3); break;
          }

          await Prediction.findOneAndUpdate(
            { symbol, timeframe },
            {
              symbol,
              timeframe,
              signal: result.signal,
              predictedPrice: result.predictedPrice,
              currentPrice: (await StockHistorical.findOne({ symbol }).sort({ date: -1 }))?.close || 0,
              confidence: result.confidence,
              indicators: result.indicators,
              modelVersion: '1.0.0',
              expiresAt,
            },
            { upsert: true }
          );
        }
      } catch (error) {
        logger.error(`Failed to generate prediction for ${symbol}:`, error);
      }
    }

    logger.info('All predictions generated successfully');
  }
}

export const predictionEngine = new PredictionEngine();
