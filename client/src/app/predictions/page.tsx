'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

const predictions = [
  {
    symbol: 'NVDA', name: 'NVIDIA', currentPrice: 875.30, predictedPrice: 920.50,
    signal: 'STRONG_BUY', confidence: 0.87, timeframe: '1W',
    indicators: { rsi: 62, macd: 'Bullish', sma: 'Above 50-day', volume: 'Increasing' },
  },
  {
    symbol: 'META', name: 'Meta Platforms', currentPrice: 505.75, predictedPrice: 540.20,
    signal: 'BUY', confidence: 0.78, timeframe: '1W',
    indicators: { rsi: 55, macd: 'Bullish', sma: 'Above 20-day', volume: 'Stable' },
  },
  {
    symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 178.50, predictedPrice: 185.00,
    signal: 'BUY', confidence: 0.72, timeframe: '1W',
    indicators: { rsi: 48, macd: 'Neutral', sma: 'At 20-day', volume: 'Stable' },
  },
  {
    symbol: 'MSFT', name: 'Microsoft', currentPrice: 415.20, predictedPrice: 425.80,
    signal: 'HOLD', confidence: 0.65, timeframe: '1W',
    indicators: { rsi: 52, macd: 'Neutral', sma: 'Above 50-day', volume: 'Decreasing' },
  },
  {
    symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 248.50, predictedPrice: 235.00,
    signal: 'SELL', confidence: 0.71, timeframe: '1W',
    indicators: { rsi: 68, macd: 'Bearish', sma: 'Below 50-day', volume: 'Increasing' },
  },
  {
    symbol: 'INTC', name: 'Intel Corp.', currentPrice: 43.20, predictedPrice: 38.50,
    signal: 'STRONG_SELL', confidence: 0.82, timeframe: '1W',
    indicators: { rsi: 74, macd: 'Bearish', sma: 'Below 200-day', volume: 'Increasing' },
  },
];

const timeframes = ['1D', '1W', '1M', '3M'];

export default function PredictionsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1W');

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY': return 'text-emerald-400';
      case 'BUY': return 'text-green-400';
      case 'HOLD': return 'text-yellow-400';
      case 'SELL': return 'text-orange-400';
      case 'STRONG_SELL': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSignalBg = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'BUY': return 'bg-green-500/10 border-green-500/30';
      case 'HOLD': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'SELL': return 'bg-orange-500/10 border-orange-500/30';
      case 'STRONG_SELL': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Brain className="w-7 h-7 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">AI Predictions</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Machine learning-powered market trend predictions using LSTM neural networks
        </p>
      </motion.div>

      {/* Model Info Card */}
      <GlassCard variant="sm" glow="primary">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Ensemble Prediction Model v1.0</p>
              <p className="text-xs text-gray-400">LSTM + Technical Indicators + Volume Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Last updated: 2 min ago</span>
            <span className="flex items-center gap-1 text-accent-400">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" /> Active
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              selectedTimeframe === tf
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((pred, index) => {
          const expectedChange = ((pred.predictedPrice - pred.currentPrice) / pred.currentPrice) * 100;
          return (
            <motion.div
              key={pred.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-white text-lg">{pred.symbol}</p>
                    <p className="text-xs text-gray-400">{pred.name}</p>
                  </div>
                  <div className={cn('px-3 py-1 rounded-lg border text-xs font-bold', getSignalBg(pred.signal))}>
                    <span className={getSignalColor(pred.signal)}>
                      {pred.signal.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Price Prediction */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/[0.03]">
                    <p className="text-[10px] text-gray-500 uppercase">Current</p>
                    <p className="text-sm font-mono text-white">{formatCurrency(pred.currentPrice)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03]">
                    <p className="text-[10px] text-gray-500 uppercase">Predicted</p>
                    <p className={cn('text-sm font-mono font-semibold', expectedChange >= 0 ? 'text-accent-400' : 'text-danger-400')}>
                      {formatCurrency(pred.predictedPrice)}
                    </p>
                  </div>
                </div>

                {/* Expected Change */}
                <div className="flex items-center gap-2 mb-4">
                  {expectedChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-accent-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-danger-400" />
                  )}
                  <span className={cn('text-sm font-semibold', expectedChange >= 0 ? 'text-accent-400' : 'text-danger-400')}>
                    {formatPercent(expectedChange)} expected
                  </span>
                </div>

                {/* Confidence Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Confidence</span>
                    <span className="text-white">{(pred.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pred.confidence * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={cn(
                        'h-full rounded-full',
                        pred.confidence >= 0.8 ? 'bg-accent-500' :
                        pred.confidence >= 0.6 ? 'bg-primary-500' : 'bg-yellow-500'
                      )}
                    />
                  </div>
                </div>

                {/* Indicators */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">RSI</span>
                    <span className={cn(
                      pred.indicators.rsi > 70 ? 'text-danger-400' :
                      pred.indicators.rsi < 30 ? 'text-accent-400' : 'text-white'
                    )}>{pred.indicators.rsi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MACD</span>
                    <span className={cn(
                      pred.indicators.macd === 'Bullish' ? 'text-accent-400' :
                      pred.indicators.macd === 'Bearish' ? 'text-danger-400' : 'text-yellow-400'
                    )}>{pred.indicators.macd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMA</span>
                    <span className="text-gray-300">{pred.indicators.sma}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volume</span>
                    <span className="text-gray-300">{pred.indicators.volume}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <GlassCard variant="sm" className="border-yellow-500/20">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Disclaimer</p>
            <p className="text-xs text-gray-400 mt-1">
              AI predictions are for educational purposes only. Past performance does not guarantee future results.
              This is a simulated trading environment. Never invest real money based solely on algorithmic predictions.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
