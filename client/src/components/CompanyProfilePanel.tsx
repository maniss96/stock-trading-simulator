'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, Loader2, ExternalLink, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { fetchCompany, hasStockfitKey } from '@/lib/ai';

function pick(obj: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') {
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      if (Array.isArray(v)) return v.join(', ');
    }
  }
  return '';
}

/**
 * Compact StockFit company profile for the selected symbol.
 * Caches results per symbol to avoid redundant API calls.
 */
export function CompanyProfilePanel({ symbol }: { symbol: string }) {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cache = useRef<Record<string, Record<string, any>>>({});
  const keyConfigured = typeof window !== 'undefined' && hasStockfitKey();

  useEffect(() => {
    if (!symbol || !keyConfigured) return;

    // Serve from cache when available
    if (cache.current[symbol]) {
      setData(cache.current[symbol]);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setData(null);

    fetchCompany(symbol)
      .then((result) => {
        if (cancelled) return;
        cache.current[symbol] = result;
        setData(result);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load company info');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, keyConfigured]);

  const name = data ? pick(data, ['name', 'companyName', 'legalName', 'title']) : '';
  const sector = data ? pick(data, ['sector', 'sicSector']) : '';
  const industry = data ? pick(data, ['industry', 'sicIndustry', 'sicDescription']) : '';
  const exchange = data ? pick(data, ['exchange', 'exchanges', 'primaryExchange', 'listings']) : '';
  const overview = data
    ? pick(data, ['businessOverview', 'overview', 'description', 'longDescription', 'summary'])
    : '';

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-400" />
          <GlassCardTitle>Company Profile · {symbol}</GlassCardTitle>
        </div>
        {data && (
          <Link
            href="/company"
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Full report <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </GlassCardHeader>

      {!keyConfigured ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
          <div className="flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              Add your StockFit key to see fundamentals (sector, industry, business overview).
            </p>
          </div>
          <Link
            href="/integrations"
            className="glass-btn text-xs px-3 py-1.5 whitespace-nowrap"
          >
            Add Key
          </Link>
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading fundamentals...
        </div>
      ) : error ? (
        <p className="text-xs text-danger-400 py-2">{error}</p>
      ) : data ? (
        <div className="space-y-3">
          {name && <p className="text-sm font-medium text-white">{name}</p>}
          <div className="flex flex-wrap gap-2">
            {sector && <span className="glass-badge text-[11px]">{sector}</span>}
            {industry && <span className="glass-badge text-[11px]">{industry}</span>}
            {exchange && <span className="glass-badge text-[11px]">{exchange}</span>}
          </div>
          {overview && (
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">{overview}</p>
          )}
        </div>
      ) : null}
    </GlassCard>
  );
}
