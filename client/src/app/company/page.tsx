'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Search,
  Loader2,
  AlertCircle,
  Globe,
  Briefcase,
  Hash,
  Calendar,
  Landmark,
  KeyRound,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { fetchCompany, hasStockfitKey } from '@/lib/ai';
import { cn } from '@/lib/utils';

// StockFit field names vary; pick the first present among candidates.
function pick(obj: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') {
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : x)).join(', ');
    }
  }
  return '';
}

export default function CompanyPage() {
  const [symbol, setSymbol] = useState('');
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [activeSymbol, setActiveSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const keyConfigured = typeof window !== 'undefined' && hasStockfitKey();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;

    setLoading(true);
    setError('');
    setData(null);
    setActiveSymbol(sym);

    try {
      const result = await fetchCompany(sym);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company data');
    } finally {
      setLoading(false);
    }
  };

  const name = data ? pick(data, ['name', 'companyName', 'legalName', 'title']) : '';
  const sector = data ? pick(data, ['sector', 'sicSector']) : '';
  const industry = data ? pick(data, ['industry', 'sicIndustry', 'sicDescription']) : '';
  const exchange = data ? pick(data, ['exchange', 'exchanges', 'listings', 'primaryExchange']) : '';
  const cik = data ? pick(data, ['cik', 'CIK']) : '';
  const fiscalYearEnd = data ? pick(data, ['fiscalYearEnd', 'fiscal_year_end', 'fyEnd']) : '';
  const website = data ? pick(data, ['website', 'irWebsite', 'investorRelations', 'homepageUrl', 'url']) : '';
  const overview = data ? pick(data, ['businessOverview', 'overview', 'description', 'longDescription', 'summary']) : '';

  const infoItems = [
    { icon: Briefcase, label: 'Sector', value: sector },
    { icon: Landmark, label: 'Industry', value: industry },
    { icon: Building2, label: 'Exchange', value: exchange },
    { icon: Hash, label: 'CIK', value: cik },
    { icon: Calendar, label: 'Fiscal Year End', value: fiscalYearEnd },
  ].filter((i) => i.value);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Building2 className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Company Fundamentals</h1>
        </div>
        <p className="text-gray-400 text-sm">
          SEC-filing fundamentals powered by StockFit — profile, sector, industry & business overview
        </p>
      </motion.div>

      {/* No key notice */}
      {!keyConfigured && (
        <GlassCard variant="sm" className="border-purple-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-300">StockFit key needed</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add your free StockFit API key to look up company fundamentals.
                </p>
              </div>
            </div>
            <Link href="/integrations">
              <GlassButton variant="solid" size="sm">Add Key</GlassButton>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter a US ticker (e.g. AAPL, MSFT, NVDA)"
            className="glass-input pl-10 text-sm"
          />
        </div>
        <GlassButton type="submit" variant="solid" disabled={loading || !symbol.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Look Up'}
        </GlassButton>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-sm text-danger-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header card */}
          <GlassCard glow="primary">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{activeSymbol}</span>
                  {website && (
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary-400"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {name && <p className="text-gray-300 mt-0.5">{name}</p>}
              </div>
            </div>

            {/* Info grid */}
            {infoItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                {infoItems.map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] uppercase tracking-wide text-gray-500">{item.label}</span>
                    </div>
                    <p className="text-sm text-white truncate" title={item.value}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Business overview */}
          {overview && (
            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" />
                  <GlassCardTitle>Business Overview</GlassCardTitle>
                </div>
              </GlassCardHeader>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {overview}
              </p>
            </GlassCard>
          )}

          {/* Raw data (for fields not surfaced above) */}
          <GlassCard variant="sm">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center justify-between w-full text-sm text-gray-300 hover:text-white"
            >
              <span>Raw StockFit response</span>
              <span className="text-xs text-gray-500">{showRaw ? 'Hide' : 'Show'}</span>
            </button>
            {showRaw && (
              <pre className="mt-3 p-3 rounded-lg bg-black/30 text-[11px] text-gray-300 overflow-x-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
