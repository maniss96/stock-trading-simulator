import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * NVIDIA NIM API Integration - MiniMax-M3
 * Provides advanced AI-powered market analysis using NVIDIA's cloud AI
 *
 * Features:
 * - Natural language market analysis
 * - Sentiment analysis on stock news
 * - AI-generated trading insights
 * - Multi-modal analysis (can process charts/images in future)
 */

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const MODEL = 'minimaxai/minimax-m3';

interface NvidiaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NvidiaResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface MarketAnalysis {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  keyFactors: string[];
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TradingInsight {
  analysis: string;
  signals: string[];
  supportLevels: number[];
  resistanceLevels: number[];
  outlook: string;
}

class NvidiaAIService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!NVIDIA_API_KEY && NVIDIA_API_KEY !== '';
    if (!this.isConfigured) {
      logger.warn('NVIDIA API key not configured. AI analysis features will be disabled.');
    }
  }

  /**
   * Send a request to NVIDIA MiniMax-M3
   */
  private async query(messages: NvidiaMessage[], maxTokens = 2048): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('NVIDIA API not configured. Set NVIDIA_API_KEY in environment.');
    }

    try {
      const response = await axios.post<NvidiaResponse>(
        NVIDIA_API_URL,
        {
          model: MODEL,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.95,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      }

      throw new Error('Empty response from NVIDIA API');
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.error('NVIDIA API authentication failed. Check API key.');
        throw new Error('AI service authentication failed');
      }
      if (error.response?.status === 429) {
        logger.warn('NVIDIA API rate limit reached');
        throw new Error('AI service rate limit reached. Try again later.');
      }
      logger.error('NVIDIA API error:', error.message);
      throw new Error('AI analysis temporarily unavailable');
    }
  }

  /**
   * Get comprehensive market analysis for a stock
   */
  async getMarketAnalysis(
    symbol: string,
    currentPrice: number,
    priceHistory: number[],
    technicalIndicators: {
      rsi: number;
      macd: number;
      sma50: number;
      sma200: number;
    }
  ): Promise<MarketAnalysis> {
    const priceChange = priceHistory.length > 1
      ? ((currentPrice - priceHistory[0]) / priceHistory[0] * 100).toFixed(2)
      : '0';

    const messages: NvidiaMessage[] = [
      {
        role: 'system',
        content: `You are a professional financial analyst AI. Analyze stock data and provide structured market insights. Always respond in valid JSON format matching this schema: { "summary": string, "sentiment": "bullish"|"bearish"|"neutral", "confidence": number(0-1), "keyFactors": string[], "recommendation": string, "riskLevel": "low"|"medium"|"high" }. Be concise and data-driven. This is for educational simulation purposes only.`,
      },
      {
        role: 'user',
        content: `Analyze ${symbol} stock:
- Current price: $${currentPrice}
- Period price change: ${priceChange}%
- RSI (14): ${technicalIndicators.rsi.toFixed(1)}
- MACD: ${technicalIndicators.macd.toFixed(3)}
- Price vs SMA50: ${((currentPrice / technicalIndicators.sma50 - 1) * 100).toFixed(2)}%
- Price vs SMA200: ${((currentPrice / technicalIndicators.sma200 - 1) * 100).toFixed(2)}%
- Recent prices (last 10 days): ${priceHistory.slice(-10).map(p => p.toFixed(2)).join(', ')}

Provide your analysis as JSON.`,
      },
    ];

    const response = await this.query(messages);

    try {
      const analysis = JSON.parse(response);
      return {
        summary: analysis.summary || 'Analysis unavailable',
        sentiment: analysis.sentiment || 'neutral',
        confidence: Math.min(Math.max(analysis.confidence || 0.5, 0), 1),
        keyFactors: analysis.keyFactors || [],
        recommendation: analysis.recommendation || 'Hold',
        riskLevel: analysis.riskLevel || 'medium',
      };
    } catch {
      // If JSON parsing fails, create structured response from text
      return {
        summary: response.substring(0, 200),
        sentiment: 'neutral',
        confidence: 0.5,
        keyFactors: ['AI analysis parsing incomplete'],
        recommendation: 'Review technical indicators manually',
        riskLevel: 'medium',
      };
    }
  }

  /**
   * Get AI-powered trading insights
   */
  async getTradingInsights(
    symbol: string,
    currentPrice: number,
    priceHistory: number[],
    volume: number[]
  ): Promise<TradingInsight> {
    const messages: NvidiaMessage[] = [
      {
        role: 'system',
        content: `You are an AI trading analyst. Provide trading insights based on price and volume data. Respond in valid JSON: { "analysis": string, "signals": string[], "supportLevels": number[], "resistanceLevels": number[], "outlook": string }. This is for educational/simulation purposes only.`,
      },
      {
        role: 'user',
        content: `Trading analysis for ${symbol} at $${currentPrice}:
- 30-day prices: ${priceHistory.slice(-30).map(p => p.toFixed(2)).join(', ')}
- Recent volume (5 days): ${volume.slice(-5).join(', ')}
- 30-day high: $${Math.max(...priceHistory.slice(-30)).toFixed(2)}
- 30-day low: $${Math.min(...priceHistory.slice(-30)).toFixed(2)}

Identify key support/resistance levels and provide trading insights as JSON.`,
      },
    ];

    const response = await this.query(messages, 1024);

    try {
      const insight = JSON.parse(response);
      return {
        analysis: insight.analysis || 'Analysis pending',
        signals: insight.signals || [],
        supportLevels: insight.supportLevels || [],
        resistanceLevels: insight.resistanceLevels || [],
        outlook: insight.outlook || 'Neutral',
      };
    } catch {
      return {
        analysis: response.substring(0, 300),
        signals: [],
        supportLevels: [],
        resistanceLevels: [],
        outlook: 'Review manually',
      };
    }
  }

  /**
   * Generate educational trading explanation
   */
  async explainTradingConcept(concept: string): Promise<string> {
    const messages: NvidiaMessage[] = [
      {
        role: 'system',
        content: 'You are a trading educator. Explain financial concepts clearly and concisely for beginner to intermediate traders. Keep responses under 300 words. Use examples when helpful.',
      },
      {
        role: 'user',
        content: `Explain this trading/investing concept: ${concept}`,
      },
    ];

    return this.query(messages, 1024);
  }

  /**
   * AI-powered portfolio review
   */
  async reviewPortfolio(
    holdings: Array<{ symbol: string; quantity: number; avgCost: number; currentPrice: number }>,
    cashBalance: number,
    totalValue: number
  ): Promise<string> {
    const holdingsSummary = holdings.map(h => {
      const pl = ((h.currentPrice - h.avgCost) / h.avgCost * 100).toFixed(1);
      return `${h.symbol}: ${h.quantity} shares, avg $${h.avgCost.toFixed(2)}, now $${h.currentPrice.toFixed(2)} (${pl}%)`;
    }).join('\n');

    const cashPercent = ((cashBalance / totalValue) * 100).toFixed(1);

    const messages: NvidiaMessage[] = [
      {
        role: 'system',
        content: 'You are a portfolio advisor for an educational trading simulator. Provide constructive feedback on portfolio composition, diversification, and risk management. Keep it concise (under 250 words). This is for learning purposes only - not real financial advice.',
      },
      {
        role: 'user',
        content: `Review my simulated portfolio:
Total value: $${totalValue.toFixed(2)}
Cash: $${cashBalance.toFixed(2)} (${cashPercent}%)

Holdings:
${holdingsSummary}

Please assess diversification, risk, and suggest improvements.`,
      },
    ];

    return this.query(messages, 1024);
  }

  /**
   * Check if the NVIDIA AI service is available
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }
}

export const nvidiaAI = new NvidiaAIService();
