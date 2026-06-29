'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { askAI, hasAIKey } from '@/lib/ai';

const SUGGESTED = [
  'Analyze AAPL for the next week',
  'Is NVDA overbought right now?',
  'Explain the RSI indicator',
  'Compare TSLA vs traditional automakers',
];

export function AILiveAnalysis() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const keyConfigured = typeof window !== 'undefined' && hasAIKey();

  const handleAsk = async (question?: string) => {
    const q = question || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await askAI(q, {
        systemPrompt:
          'You are an expert financial analyst for an educational stock trading simulator. Give concise, structured insights with clear reasoning. Use bullet points where helpful. Always remind that this is educational, not financial advice. Keep under 350 words.',
        maxTokens: 1200,
      });
      setResponse(result);
    } catch (e: any) {
      setError(e.message || 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard glow="primary">
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <GlassCardTitle>Ask AI (MiniMax-M3)</GlassCardTitle>
        </div>
        {keyConfigured && (
          <span className="glass-badge-success text-[10px]">Connected</span>
        )}
      </GlassCardHeader>

      {!keyConfigured ? (
        <div className="flex flex-col items-center text-center py-6 gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">No AI key configured</p>
            <p className="text-xs text-gray-400 mt-1">
              Add your NVIDIA API key to unlock live AI analysis.
            </p>
          </div>
          <Link href="/integrations">
            <GlassButton variant="solid" size="sm">
              Add API Key
            </GlassButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Input */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask about any stock, strategy, or indicator..."
              className="glass-input flex-1 text-sm"
            />
            <GlassButton
              variant="solid"
              onClick={() => handleAsk()}
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </GlassButton>
          </div>

          {/* Suggestions */}
          {!response && !loading && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPrompt(s);
                    handleAsk(s);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-sm text-danger-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is analyzing market data...
            </div>
          )}

          {/* Response */}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]"
            >
              <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                {response}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
