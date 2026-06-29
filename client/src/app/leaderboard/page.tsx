'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

const leaderboardData = [
  { rank: 1, username: 'TraderPro99', profitLoss: 42580, profitLossPercent: 42.58, trades: 156, winRate: 78.2, sharpe: 2.45, score: 94 },
  { rank: 2, username: 'WallStWizard', profitLoss: 38920, profitLossPercent: 38.92, trades: 203, winRate: 72.1, sharpe: 2.12, score: 91 },
  { rank: 3, username: 'AlgoMaster', profitLoss: 35100, profitLossPercent: 35.10, trades: 89, winRate: 82.0, sharpe: 2.85, score: 89 },
  { rank: 4, username: 'StockNinja', profitLoss: 29850, profitLossPercent: 29.85, trades: 124, winRate: 69.3, sharpe: 1.95, score: 85 },
  { rank: 5, username: 'BullRunner', profitLoss: 27400, profitLossPercent: 27.40, trades: 178, winRate: 65.8, sharpe: 1.78, score: 82 },
  { rank: 6, username: 'MarketSage', profitLoss: 24200, profitLossPercent: 24.20, trades: 95, winRate: 74.7, sharpe: 2.01, score: 80 },
  { rank: 7, username: 'QuantKing', profitLoss: 21800, profitLossPercent: 21.80, trades: 312, winRate: 61.2, sharpe: 1.65, score: 77 },
  { rank: 8, username: 'DayTrader42', profitLoss: 18950, profitLossPercent: 18.95, trades: 445, winRate: 58.4, sharpe: 1.42, score: 74 },
  { rank: 9, username: 'ValueHunter', profitLoss: 16300, profitLossPercent: 16.30, trades: 52, winRate: 80.8, sharpe: 2.34, score: 72 },
  { rank: 10, username: 'TechInvestor', profitLoss: 14750, profitLossPercent: 14.75, trades: 87, winRate: 71.3, sharpe: 1.89, score: 70 },
];

const timeframes = ['Daily', 'Weekly', 'Monthly', 'All Time'];

export default function LeaderboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('All Time');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/5 border-yellow-500/20';
      case 2: return 'bg-gray-300/5 border-gray-300/20';
      case 3: return 'bg-amber-600/5 border-amber-600/20';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-7 h-7 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        </div>
        <p className="text-gray-400 text-sm">Top traders ranked by composite performance score</p>
      </motion.div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboardData.slice(0, 3).map((trader, index) => (
          <motion.div
            key={trader.username}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <GlassCard
              className={cn(
                'text-center relative overflow-hidden',
                index === 0 && 'border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.15)]'
              )}
            >
              {index === 0 && (
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
              )}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 mx-auto mb-3 flex items-center justify-center text-xl font-bold">
                  {trader.username.charAt(0)}
                </div>
                <div className="mb-2">{getRankIcon(trader.rank)}</div>
                <p className="font-bold text-white text-lg">{trader.username}</p>
                <p className="text-accent-400 font-semibold mt-1">
                  +{formatCurrency(trader.profitLoss)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Score: {trader.score}/100
                </p>
                <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" /> {trader.winRate}%
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> {trader.sharpe.toFixed(2)}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

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

      {/* Full Rankings Table */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Rankings</GlassCardTitle>
          <span className="text-xs text-gray-400">{leaderboardData.length} traders</span>
        </GlassCardHeader>
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Trader</th>
                <th>Profit/Loss</th>
                <th>Return %</th>
                <th>Trades</th>
                <th>Win Rate</th>
                <th>Sharpe</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((trader, index) => (
                <motion.tr
                  key={trader.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={getRankBg(trader.rank)}
                >
                  <td>
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(trader.rank)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                        {trader.username.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{trader.username}</span>
                    </div>
                  </td>
                  <td className="text-accent-400 font-mono font-medium">
                    +{formatCurrency(trader.profitLoss)}
                  </td>
                  <td className="text-accent-400">
                    {formatPercent(trader.profitLossPercent)}
                  </td>
                  <td className="text-gray-300">{trader.trades}</td>
                  <td className="text-white">{trader.winRate}%</td>
                  <td className="text-primary-300">{trader.sharpe.toFixed(2)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                          style={{ width: `${trader.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-white font-semibold">{trader.score}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
