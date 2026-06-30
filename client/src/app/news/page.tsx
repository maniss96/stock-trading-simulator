'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Search,
  AlertCircle,
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { fetchNews, hasAIKey, NewsArticle } from '@/lib/ai';
import { timeAgo, cn } from '@/lib/utils';

function SentimentBadge({ sentiment }: { sentiment?: string }) {
  if (!sentiment) return null;
  const config = {
    positive: { icon: TrendingUp, cls: 'glass-badge-success', label: 'Bullish' },
    negative: { icon: TrendingDown, cls: 'glass-badge-danger', label: 'Bearish' },
    neutral: { icon: Minus, cls: 'glass-badge-warning', label: 'Neutral' },
  }[sentiment] || { icon: Minus, cls: 'glass-badge', label: sentiment };

  const Icon = config.icon;
  return (
    <span className={cn('glass-badge', config.cls, 'gap-1')}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [overall, setOverall] = useState('');
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState('');
  const [sentimentApplied, setSentimentApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [activeSymbol, setActiveSymbol] = useState('');
  const aiEnabled = typeof window !== 'undefined' && hasAIKey();

  const load = useCallback(async (symbol: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchNews(symbol);
      setArticles(result.articles);
      setOverall(result.overall);
      setSummary(result.summary);
      setSource(result.source);
      setSentimentApplied(result.sentimentApplied);
    } catch (e: any) {
      setError(e.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = searchSymbol.trim().toUpperCase();
    setActiveSymbol(sym);
    load(sym);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Newspaper className="w-7 h-7 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">Market News & AI Sentiment</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Latest headlines with AI-powered sentiment analysis
        </p>
      </motion.div>

      {/* Search + refresh */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="Filter by symbol (e.g. AAPL) or leave blank for general"
              className="glass-input pl-10 text-sm"
            />
          </div>
          <GlassButton type="submit" variant="primary">
            Search
          </GlassButton>
        </form>
        <GlassButton variant="ghost" onClick={() => load(activeSymbol)} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </GlassButton>
      </div>

      {/* AI key notice */}
      {!aiEnabled && (
        <GlassCard variant="sm" className="border-yellow-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-300">AI sentiment is off</p>
              <p className="text-xs text-gray-400 mt-1">
                Add your NVIDIA API key on the API Keys page to enable automatic
                sentiment scoring of headlines.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Overall sentiment summary */}
      {sentimentApplied && summary && (
        <GlassCard glow={overall === 'positive' ? 'success' : overall === 'negative' ? 'danger' : 'primary'}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white">AI Market Mood</p>
                <SentimentBadge sentiment={overall} />
              </div>
              <p className="text-sm text-gray-300">{summary}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Source indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className={cn(
          'w-2 h-2 rounded-full',
          source === 'simulated' ? 'bg-yellow-400' : 'bg-accent-400'
        )} />
        {source === 'simulated' ? 'Demo headlines' : 'Live news · Finnhub'}
        {activeSymbol && <span>· filtered: {activeSymbol}</span>}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-sm text-danger-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* News list */}
      {loading ? (
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article, i) => (
            <motion.a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
            >
              <GlassCard className="h-full group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs text-gray-400">{article.source}</span>
                  <div className="flex items-center gap-2">
                    <SentimentBadge sentiment={article.sentiment} />
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2">
                  {article.headline}
                </h3>
                {article.summary && (
                  <p className="text-xs text-gray-400 line-clamp-3 mb-3">{article.summary}</p>
                )}
                <p className="text-[11px] text-gray-500">
                  {timeAgo(new Date(article.datetime * 1000))}
                </p>
              </GlassCard>
            </motion.a>
          ))}
        </div>
      )}

      {!loading && articles.length === 0 && !error && (
        <p className="text-center text-gray-400 py-12">No news found.</p>
      )}
    </div>
  );
}
