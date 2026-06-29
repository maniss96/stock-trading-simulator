'use client';

import { motion } from 'framer-motion';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  Target,
  Activity,
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

const holdings = [
  { symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, avgCost: 170.20, currentPrice: 178.50, allocation: 25 },
  { symbol: 'NVDA', name: 'NVIDIA', quantity: 10, avgCost: 820.00, currentPrice: 875.30, allocation: 24 },
  { symbol: 'MSFT', name: 'Microsoft', quantity: 20, avgCost: 400.50, currentPrice: 415.20, allocation: 23 },
  { symbol: 'META', name: 'Meta Platforms', quantity: 15, avgCost: 480.00, currentPrice: 505.75, allocation: 21 },
  { symbol: 'JPM', name: 'JPMorgan', quantity: 25, avgCost: 190.30, currentPrice: 198.40, allocation: 7 },
];

const metrics = {
  sharpeRatio: 1.85,
  maxDrawdown: 8.2,
  winRate: 68.5,
  avgReturn: 3.2,
  totalTrades: 47,
  bestTrade: 2450.00,
  worstTrade: -890.00,
};

export default function PortfolioPage() {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.avgCost * h.quantity, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPercent = (totalPL / totalCost) * 100;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <p className="text-gray-400 text-sm mt-1">Track your holdings and performance metrics</p>
      </motion.div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="sm" glow={totalPL >= 0 ? 'success' : 'danger'}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Value</p>
              <p className="text-lg font-bold text-white">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="sm">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              totalPL >= 0 ? 'bg-accent-600/20' : 'bg-danger-600/20'
            )}>
              {totalPL >= 0 ? <TrendingUp className="w-5 h-5 text-accent-400" /> : <TrendingDown className="w-5 h-5 text-danger-400" />}
            </div>
            <div>
              <p className="text-xs text-gray-400">Total P&L</p>
              <p className={cn('text-lg font-bold', totalPL >= 0 ? 'text-accent-400' : 'text-danger-400')}>
                {totalPL >= 0 ? '+' : ''}{formatCurrency(totalPL)}
              </p>
              <p className={cn('text-xs', totalPL >= 0 ? 'text-accent-400/70' : 'text-danger-400/70')}>
                {formatPercent(totalPLPercent)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Sharpe Ratio</p>
              <p className="text-lg font-bold text-white">{metrics.sharpeRatio.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Risk-adjusted return</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Win Rate</p>
              <p className="text-lg font-bold text-white">{metrics.winRate}%</p>
              <p className="text-xs text-gray-500">{metrics.totalTrades} trades</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Holdings Table */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Holdings</GlassCardTitle>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">{holdings.length} positions</span>
          </div>
        </GlassCardHeader>
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Shares</th>
                <th>Avg Cost</th>
                <th>Current</th>
                <th>Value</th>
                <th>P&L</th>
                <th>Allocation</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => {
                const value = holding.currentPrice * holding.quantity;
                const cost = holding.avgCost * holding.quantity;
                const pl = value - cost;
                const plPercent = (pl / cost) * 100;

                return (
                  <tr key={holding.symbol}>
                    <td>
                      <div>
                        <p className="font-semibold text-white">{holding.symbol}</p>
                        <p className="text-xs text-gray-400">{holding.name}</p>
                      </div>
                    </td>
                    <td className="text-white">{holding.quantity}</td>
                    <td className="font-mono text-gray-300">{formatCurrency(holding.avgCost)}</td>
                    <td className="font-mono text-white">{formatCurrency(holding.currentPrice)}</td>
                    <td className="font-mono text-white font-medium">{formatCurrency(value)}</td>
                    <td>
                      <div className={cn(
                        'inline-flex items-center gap-1',
                        pl >= 0 ? 'text-accent-400' : 'text-danger-400'
                      )}>
                        {pl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <div>
                          <p className="text-xs font-medium">{pl >= 0 ? '+' : ''}{formatCurrency(pl)}</p>
                          <p className="text-[10px] opacity-70">{formatPercent(plPercent)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-500"
                            style={{ width: `${holding.allocation}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{holding.allocation}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard variant="sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-danger-400" />
            <p className="text-xs text-gray-400">Max Drawdown</p>
          </div>
          <p className="text-2xl font-bold text-danger-400">-{metrics.maxDrawdown}%</p>
          <p className="text-xs text-gray-500 mt-1">Largest peak-to-trough decline</p>
        </GlassCard>

        <GlassCard variant="sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent-400" />
            <p className="text-xs text-gray-400">Best Trade</p>
          </div>
          <p className="text-2xl font-bold text-accent-400">+{formatCurrency(metrics.bestTrade)}</p>
          <p className="text-xs text-gray-500 mt-1">Highest single trade return</p>
        </GlassCard>

        <GlassCard variant="sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-danger-400" />
            <p className="text-xs text-gray-400">Worst Trade</p>
          </div>
          <p className="text-2xl font-bold text-danger-400">{formatCurrency(metrics.worstTrade)}</p>
          <p className="text-xs text-gray-500 mt-1">Largest single trade loss</p>
        </GlassCard>
      </div>
    </div>
  );
}
