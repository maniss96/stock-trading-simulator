'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/lib/store';
import { useQuotes } from '@/hooks/useQuotes';
import { formatCurrency, formatPercent, timeAgo, cn } from '@/lib/utils';

// Mock data for demonstration
const portfolioStats = {
  totalValue: 105420.50,
  cashBalance: 42150.00,
  dayChange: 1250.75,
  dayChangePercent: 1.20,
  totalReturn: 5420.50,
  totalReturnPercent: 5.42,
};

// Symbols tracked on the dashboard (live prices overlaid via useQuotes)
const MOVERS_META: Record<string, string> = {
  NVDA: 'NVIDIA',
  TSLA: 'Tesla',
  AAPL: 'Apple',
  META: 'Meta',
  AMZN: 'Amazon',
};
const MOVER_SYMBOLS = Object.keys(MOVERS_META);

const recentTrades = [
  { symbol: 'AAPL', side: 'BUY', quantity: 10, price: 175.20, time: '2h ago' },
  { symbol: 'NVDA', side: 'SELL', quantity: 5, price: 870.50, time: '5h ago' },
  { symbol: 'MSFT', side: 'BUY', quantity: 15, price: 412.80, time: '1d ago' },
];

const aiSignals = [
  { symbol: 'NVDA', signal: 'STRONG_BUY', confidence: 0.87, predicted: 920.50 },
  { symbol: 'AAPL', signal: 'BUY', confidence: 0.72, predicted: 185.00 },
  { symbol: 'TSLA', signal: 'HOLD', confidence: 0.65, predicted: 252.00 },
  { symbol: 'META', signal: 'BUY', confidence: 0.78, predicted: 530.00 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { quotes, lastUpdated, provider } = useQuotes(MOVER_SYMBOLS);

  // Build mover rows from live quotes, sorted by absolute % change
  const topMovers = MOVER_SYMBOLS.map((symbol) => {
    const q = quotes[symbol];
    return {
      symbol,
      name: MOVERS_META[symbol],
      price: q?.price ?? 0,
      change: q?.changePercent ?? 0,
      hasData: !!q,
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white">
          Welcome back{user ? `, ${user.username}` : ''}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Here&apos;s your trading overview for today
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Portfolio Value</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(portfolioStats.totalValue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-accent-400" />
            <span className="text-xs text-accent-400">
              {formatPercent(portfolioStats.totalReturnPercent)}
            </span>
            <span className="text-xs text-gray-500">all time</span>
          </div>
        </GlassCard>

        <GlassCard variant="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Today&apos;s Change</p>
              <p className={cn(
                'text-xl font-bold',
                portfolioStats.dayChange >= 0 ? 'text-accent-400' : 'text-danger-400'
              )}>
                {portfolioStats.dayChange >= 0 ? '+' : ''}{formatCurrency(portfolioStats.dayChange)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent-600/20 flex items-center justify-center">
              {portfolioStats.dayChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-accent-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger-400" />
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <Activity className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">
              {formatPercent(portfolioStats.dayChangePercent)}
            </span>
          </div>
        </GlassCard>

        <GlassCard variant="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Cash Available</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(portfolioStats.cashBalance)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-gray-400">
              {((portfolioStats.cashBalance / portfolioStats.totalValue) * 100).toFixed(0)}% of portfolio
            </span>
          </div>
        </GlassCard>

        <GlassCard variant="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Win Rate</p>
              <p className="text-xl font-bold text-white">
                {user?.winRate?.toFixed(1) || '0.0'}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-gray-400">
              {user?.totalTrades || 0} total trades
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Movers */}
        <GlassCard className="lg:col-span-2">
          <GlassCardHeader>
            <GlassCardTitle>Market Movers</GlassCardTitle>
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className={cn(
                'w-2 h-2 rounded-full',
                provider === 'simulated' ? 'bg-yellow-400' : 'bg-accent-400 animate-pulse'
              )} />
              {provider === 'simulated' ? 'Demo data' : `Live · ${provider}`}
              {lastUpdated && (
                <span className="text-gray-500 hidden sm:inline">· {timeAgo(lastUpdated)}</span>
              )}
            </span>
          </GlassCardHeader>
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {topMovers.map((stock) => (
                  <tr key={stock.symbol}>
                    <td>
                      <div>
                        <p className="font-semibold text-white">{stock.symbol}</p>
                        <p className="text-xs text-gray-400">{stock.name}</p>
                      </div>
                    </td>
                    <td className="font-mono text-white">
                      {stock.hasData ? formatCurrency(stock.price) : (
                        <span className="inline-block w-16 h-4 glass-skeleton rounded" />
                      )}
                    </td>
                    <td>
                      {stock.hasData ? (
                        <div className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
                          stock.change >= 0
                            ? 'bg-accent-500/10 text-accent-400'
                            : 'bg-danger-500/10 text-danger-400'
                        )}>
                          {stock.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {formatPercent(stock.change)}
                        </div>
                      ) : (
                        <span className="inline-block w-12 h-4 glass-skeleton rounded" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* AI Signals */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>AI Signals</GlassCardTitle>
            <span className="glass-badge text-primary-300">
              <Activity className="w-3 h-3 mr-1" /> Live
            </span>
          </GlassCardHeader>
          <div className="space-y-3">
            {aiSignals.map((signal) => (
              <div
                key={signal.symbol}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
              >
                <div>
                  <p className="font-semibold text-white text-sm">{signal.symbol}</p>
                  <p className="text-xs text-gray-400">
                    Target: {formatCurrency(signal.predicted)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-xs font-semibold',
                    signal.signal.includes('BUY') ? 'text-accent-400' :
                    signal.signal.includes('SELL') ? 'text-danger-400' : 'text-yellow-400'
                  )}>
                    {signal.signal.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(signal.confidence * 100).toFixed(0)}% conf.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Trades */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Recent Trades</GlassCardTitle>
        </GlassCardHeader>
        <div className="space-y-2">
          {recentTrades.map((trade, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'px-2 py-0.5 rounded text-xs font-bold',
                  trade.side === 'BUY' ? 'bg-accent-500/20 text-accent-400' : 'bg-danger-500/20 text-danger-400'
                )}>
                  {trade.side}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{trade.symbol}</p>
                  <p className="text-xs text-gray-400">{trade.quantity} shares @ {formatCurrency(trade.price)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-white">{formatCurrency(trade.price * trade.quantity)}</p>
                <p className="text-xs text-gray-500">{trade.time}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
