'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Brain, Shield, Users, ArrowRight, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';

const features = [
  {
    icon: TrendingUp,
    title: 'Real-Time Trading',
    description: 'Buy and sell stocks with $100K virtual funds. Practice with market, limit, and stop-loss orders.',
  },
  {
    icon: Brain,
    title: 'AI Predictions',
    description: 'LSTM-powered market trend predictions with confidence scores and technical indicators.',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Analytics',
    description: 'Track your performance with Sharpe ratio, max drawdown, and comprehensive metrics.',
  },
  {
    icon: Users,
    title: 'Competitive Leaderboard',
    description: 'Compete with other traders. Climb the ranks with smart trading strategies.',
  },
  {
    icon: Shield,
    title: 'Zero Risk',
    description: 'All trading is simulated. Learn investing without risking real money.',
  },
  {
    icon: Zap,
    title: 'Real Market Data',
    description: 'Trade with real stock prices and market data. Practice in realistic conditions.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/20 border border-primary-500/30 mb-6">
              <Brain className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">AI-Powered Trading Simulator</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Master Trading with</span>
              <br />
              <span className="text-gradient">AI Intelligence</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Practice stock trading with $100,000 in virtual funds. Get AI-powered predictions,
              track your portfolio performance, and compete on the leaderboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="glass-btn-solid text-base px-8 py-4 inline-flex items-center gap-2">
                Start Trading Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="glass-btn text-base px-8 py-4">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Learn Trading
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              A comprehensive platform designed for aspiring traders and seasoned investors alike.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard variant="lg" className="text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '15+', label: 'Stocks Available' },
                { value: '$100K', label: 'Virtual Funds' },
                { value: '4', label: 'AI Timeframes' },
                { value: '∞', label: 'Free Trades' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-gradient mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
