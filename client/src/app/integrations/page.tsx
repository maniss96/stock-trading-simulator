'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plug,
  Key,
  Brain,
  LineChart,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { useApiKeyStore } from '@/lib/store';
import { testNvidiaKey } from '@/lib/ai';
import { cn } from '@/lib/utils';

type TestState = 'idle' | 'testing' | 'success' | 'error';

export default function IntegrationsPage() {
  const {
    nvidiaApiKey,
    nvidiaModel,
    alphaVantageKey,
    finnhubKey,
    stockfitKey,
    dataProvider,
    loadKeys,
    setKey,
    saveKeys,
    clearKeys,
  } = useApiKeyStore();

  const [showNvidia, setShowNvidia] = useState(false);
  const [showAlpha, setShowAlpha] = useState(false);
  const [showFinnhub, setShowFinnhub] = useState(false);
  const [showStockfit, setShowStockfit] = useState(false);
  const [testState, setTestState] = useState<TestState>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleSave = () => {
    saveKeys();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestNvidia = async () => {
    if (!nvidiaApiKey) {
      setTestState('error');
      setTestMessage('Enter an API key first');
      return;
    }
    setTestState('testing');
    setTestMessage('');
    try {
      const result = await testNvidiaKey(nvidiaApiKey, nvidiaModel);
      setTestState(result.valid ? 'success' : 'error');
      setTestMessage(result.message);
    } catch (e: any) {
      setTestState('error');
      setTestMessage(e.message || 'Test failed');
    }
  };

  const handleClear = () => {
    if (confirm('Clear all saved API keys from this device?')) {
      clearKeys();
      setTestState('idle');
      setTestMessage('');
    }
  };

  const maskInput = (show: boolean) => (show ? 'text' : 'password');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Plug className="w-7 h-7 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">API Keys & Integrations</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Add or update your API keys here. They are stored only on this device.
        </p>
      </motion.div>

      {/* Privacy notice */}
      <GlassCard variant="sm" className="border-accent-500/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent-300">Your keys stay private</p>
            <p className="text-xs text-gray-400 mt-1">
              Keys are saved in your browser&apos;s local storage on this device only. They are sent
              securely with each request and never stored on our servers or shared.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* NVIDIA AI */}
      <GlassCard glow="primary">
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-400" />
            <GlassCardTitle>NVIDIA AI (MiniMax-M3)</GlassCardTitle>
          </div>
          <a
            href="https://build.nvidia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            Get key <ExternalLink className="w-3 h-3" />
          </a>
        </GlassCardHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={maskInput(showNvidia)}
                value={nvidiaApiKey}
                onChange={(e) => setKey('nvidiaApiKey', e.target.value)}
                placeholder="nvapi-..."
                className="glass-input pl-10 pr-10 font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowNvidia(!showNvidia)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNvidia ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Model</label>
            <select
              value={nvidiaModel}
              onChange={(e) => setKey('nvidiaModel', e.target.value)}
              className="glass-select"
            >
              <option value="minimaxai/minimax-m3">MiniMax-M3</option>
              <option value="meta/llama-3.3-70b-instruct">Llama 3.3 70B</option>
              <option value="mistralai/mixtral-8x22b-instruct-v0.1">Mixtral 8x22B</option>
              <option value="deepseek-ai/deepseek-r1">DeepSeek R1</option>
              <option value="qwen/qwen2.5-72b-instruct">Qwen 2.5 72B</option>
            </select>
          </div>

          {/* Test result */}
          {testMessage && (
            <div
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl text-sm',
                testState === 'success'
                  ? 'bg-accent-500/10 border border-accent-500/30 text-accent-300'
                  : 'bg-danger-500/10 border border-danger-500/30 text-danger-300'
              )}
            >
              {testState === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {testMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <GlassButton
              variant="primary"
              onClick={handleTestNvidia}
              disabled={testState === 'testing'}
              className="flex-1"
            >
              {testState === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Stock Data Provider */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-accent-400" />
            <GlassCardTitle>Real-Time Stock Data</GlassCardTitle>
          </div>
        </GlassCardHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Data Provider</label>
            <select
              value={dataProvider}
              onChange={(e) => setKey('dataProvider', e.target.value)}
              className="glass-select"
            >
              <option value="simulated">Simulated (no key needed)</option>
              <option value="finnhub">Finnhub (real-time, recommended)</option>
              <option value="alphavantage">Alpha Vantage</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {dataProvider === 'simulated' && 'Uses generated demo prices — great for testing.'}
              {dataProvider === 'finnhub' && 'Real-time quotes. Free tier: 60 calls/min.'}
              {dataProvider === 'alphavantage' && 'Free tier: 25 requests/day, 5/min.'}
            </p>
          </div>

          {/* Finnhub key */}
          <div className={cn(dataProvider !== 'finnhub' && 'opacity-50')}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-300">Finnhub API Key</label>
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
              >
                Get free key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={maskInput(showFinnhub)}
                value={finnhubKey}
                onChange={(e) => setKey('finnhubKey', e.target.value)}
                placeholder="Your Finnhub key"
                className="glass-input pl-10 pr-10 font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowFinnhub(!showFinnhub)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showFinnhub ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Alpha Vantage key */}
          <div className={cn(dataProvider !== 'alphavantage' && 'opacity-50')}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-300">Alpha Vantage Key</label>
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
              >
                Get free key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={maskInput(showAlpha)}
                value={alphaVantageKey}
                onChange={(e) => setKey('alphaVantageKey', e.target.value)}
                placeholder="Your Alpha Vantage key"
                className="glass-input pl-10 pr-10 font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowAlpha(!showAlpha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showAlpha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* StockFit Fundamentals */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <GlassCardTitle>Company Fundamentals (StockFit)</GlassCardTitle>
          </div>
          <a
            href="https://developer.stockfit.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Get free key <ExternalLink className="w-3 h-3" />
          </a>
        </GlassCardHeader>

        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            StockFit provides company profiles, financials, ownership & earnings from SEC
            filings. Powers the <span className="text-purple-300">Fundamentals</span> page.
            Note: it does not provide live prices.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={maskInput(showStockfit)}
                value={stockfitKey}
                onChange={(e) => setKey('stockfitKey', e.target.value)}
                placeholder="fl_..."
                className="glass-input pl-10 pr-10 font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowStockfit(!showStockfit)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showStockfit ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4">
        <GlassButton variant="solid" onClick={handleSave} className="flex-1" size="lg">
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save All Keys
            </>
          )}
        </GlassButton>
        <GlassButton variant="danger" onClick={handleClear} size="lg">
          <Trash2 className="w-4 h-4" /> Clear
        </GlassButton>
      </div>
    </div>
  );
}
