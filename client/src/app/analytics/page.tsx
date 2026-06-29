'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, PieChart, Calendar, ArrowUpRight } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

const monthlyPerformance = [
  { month: 'Jan', return: 4.2, trades: 12 },
  { month: 'Feb', return: -1.8, trades: 15 },
  { month: 'Mar', return: 6.5, trades: 18 },
  { month: 'Apr', return: 2.1, trades: 10 },
  { month: 'May', return: -0.5, trades: 8 },
  { month: 'Jun', return: 8.3, trades: 22 },
];

const sectorAllocation = [
  { sector: 'Technology', allocation: 45, color: 'bg-blue-500' },
  { sector: 'Finance', allocation: 20, color: 'bg-green-500' },
  { sector: 'Healthcare', allocation: 15, color: 'bg-purple-500' },
  { sector: 'Consumer', allocation: 12, color: 'bg-orange-500' },
  { sector: 'Energy', allocation: 8, color: 'bg-red-500' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="w-7 h-7 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>
        <p className="text-gray-400 text-sm">Detailed performance analytics and trading insights</p>
      </motion.div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Return', value: formatPercent(18.8), icon: TrendingUp, color: 'text-accent-400' },
          { label: 'Sharpe Ratio', value: '1.85', icon: Activity, color: 'text-primary-400' },
          { label: 'Max Drawdown', value: '-8.2%', icon: BarChart3, color: 'text-danger-400' },
          { label: 'Avg Hold Time', value: '4.2 days', icon: Calendar, color: 'text-purple-400' },
        ].map((metric, i) => (
          <GlassCard key={metric.label} variant="sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <metric.icon className={cn('w-5 h-5', metric.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{metric.label}</p>
                <p className={cn('text-lg font-bold', metric.color)}>{metric.value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Returns */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Monthly Returns</GlassCardTitle>
            <Calendar className="w-4 h-4 text-gray-400" />
          </GlassCardHeader>
          <div className="space-y-3">
            {monthlyPerformance.map((month) => (
              <div key={month.month} className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-10">{month.month}</span>
                <div className="flex-1 relative">
                  <div className="h-8 rounded-lg bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.abs(month.return) * 8}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn(
                        'h-full rounded-lg',
                        month.return >= 0
                          ? 'bg-gradient-to-r from-accent-600/30 to-accent-500/50'
                          : 'bg-gradient-to-r from-danger-600/30 to-danger-500/50'
                      )}
                    />
                  </div>
                </div>
                <div className="text-right w-20">
                  <p className={cn(
                    'text-sm font-semibold',
                    month.return >= 0 ? 'text-accent-400' : 'text-danger-400'
                  )}>
                    {formatPercent(month.return)}
                  </p>
                  <p className="text-[10px] text-gray-500">{month.trades} trades</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Sector Allocation */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Sector Allocation</GlassCardTitle>
            <PieChart className="w-4 h-4 text-gray-400" />
          </GlassCardHeader>
          <div className="space-y-4">
            {sectorAllocation.map((sector) => (
              <div key={sector.sector} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{sector.sector}</span>
                  <span className="text-white font-medium">{sector.allocation}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sector.allocation}%` }}
                    transition={{ duration: 0.8 }}
                    className={cn('h-full rounded-full', sector.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Trading Patterns */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Trading Insights</GlassCardTitle>
          <ArrowUpRight className="w-4 h-4 text-gray-400" />
        </GlassCardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-gray-400 mb-1">Best Performing Sector</p>
            <p className="text-lg font-bold text-white">Technology</p>
            <p className="text-xs text-accent-400">+24.5% avg return</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-gray-400 mb-1">Most Traded Stock</p>
            <p className="text-lg font-bold text-white">AAPL</p>
            <p className="text-xs text-primary-400">18 trades</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-gray-400 mb-1">Best Trading Day</p>
            <p className="text-lg font-bold text-white">Wednesday</p>
            <p className="text-xs text-accent-400">82% win rate</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
