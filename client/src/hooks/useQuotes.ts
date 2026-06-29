'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchQuote } from '@/lib/ai';

export interface LiveQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  provider: string;
}

interface UseQuotesResult {
  quotes: Record<string, LiveQuote>;
  loading: boolean;
  lastUpdated: Date | null;
  provider: string;
  refresh: () => void;
}

/**
 * Polls live quotes for a list of symbols at a fixed interval.
 *
 * - Fetches sequentially with a small stagger to respect provider rate limits.
 * - Falls back to the simulated provider automatically (handled server-side).
 * - Cleans up on unmount and pauses when the tab is hidden.
 *
 * @param symbols list of ticker symbols to track
 * @param intervalMs polling interval (default 15s — safe for Finnhub free tier)
 */
export function useQuotes(symbols: string[], intervalMs = 15000): UseQuotesResult {
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [provider, setProvider] = useState('simulated');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const symbolsKey = symbols.join(',');

  const loadAll = useCallback(async () => {
    if (symbols.length === 0) return;
    try {
      const results: Record<string, LiveQuote> = {};
      // Sequential fetch with stagger to avoid hammering rate limits
      for (const symbol of symbols) {
        try {
          const q = await fetchQuote(symbol);
          results[symbol] = q;
          if (q.provider) setProvider(q.provider);
        } catch {
          // skip failed symbol, keep previous value if any
        }
        // small delay between calls
        await new Promise((r) => setTimeout(r, 120));
      }
      setQuotes((prev) => ({ ...prev, ...results }));
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  useEffect(() => {
    setLoading(true);
    loadAll();

    const start = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(loadAll, intervalMs);
    };
    const stop = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };

    start();

    // Pause polling when the tab is hidden to save quota/battery
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        loadAll();
        start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey, intervalMs]);

  return { quotes, loading, lastUpdated, provider, refresh: loadAll };
}
