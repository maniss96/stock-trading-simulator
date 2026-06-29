'use client';

import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Brain, BarChart3, Shield, Code, ArrowRight } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

const learningPaths = [
  {
    title: 'Trading Fundamentals',
    description: 'Learn the basics of stock trading, order types, and market mechanics.',
    icon: TrendingUp,
    level: 'Beginner',
    lessons: 8,
    duration: '2 hours',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    title: 'Technical Analysis',
    description: 'Master RSI, MACD, Bollinger Bands, and other technical indicators.',
    icon: BarChart3,
    level: 'Intermediate',
    lessons: 12,
    duration: '4 hours',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'AI & Machine Learning',
    description: 'Understand how AI predictions work, LSTM networks, and ensemble methods.',
    icon: Brain,
    level: 'Advanced',
    lessons: 10,
    duration: '5 hours',
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Risk Management',
    description: 'Learn position sizing, portfolio diversification, and risk mitigation.',
    icon: Shield,
    level: 'Intermediate',
    lessons: 6,
    duration: '2 hours',
    color: 'from-orange-500/20 to-yellow-500/20',
    borderColor: 'border-orange-500/30',
  },
  {
    title: 'Building Trading Algorithms',
    description: 'Create your own trading strategies and automated decision systems.',
    icon: Code,
    level: 'Advanced',
    lessons: 15,
    duration: '8 hours',
    color: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/30',
  },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner': return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'Intermediate': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'Advanced': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    default: return 'text-gray-400';
  }
};

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-7 h-7 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">Learning Center</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Master trading concepts from fundamentals to AI-powered strategies
        </p>
      </motion.div>

      {/* Learning Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningPaths.map((path, index) => (
          <motion.div
            key={path.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className={cn('h-full cursor-pointer group', path.borderColor)}>
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br',
                path.color
              )}>
                <path.icon className="w-6 h-6 text-white" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">{path.title}</h3>
              </div>

              <p className="text-sm text-gray-400 mb-4">{path.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className={cn('px-2 py-0.5 rounded-md border', getLevelColor(path.level))}>
                    {path.level}
                  </span>
                  <span>{path.lessons} lessons</span>
                  <span>{path.duration}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Tips */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Quick Trading Tips</GlassCardTitle>
        </GlassCardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'Never invest more than 25% of your portfolio in a single stock',
            'Use stop-loss orders to limit your downside risk',
            'Diversify across different sectors to reduce volatility',
            'Pay attention to volume - it confirms price movements',
            'RSI above 70 is overbought, below 30 is oversold',
            'The trend is your friend - trade with momentum',
          ].map((tip, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-sm text-gray-300"
            >
              <span className="text-primary-400 font-bold mr-2">#{i + 1}</span>
              {tip}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
