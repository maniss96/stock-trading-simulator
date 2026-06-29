import { ApiKeyConfig } from './store';

const STORAGE_KEY = 'stocksim_api_config';

function getConfig(): ApiKeyConfig {
  if (typeof window === 'undefined') {
    return {
      nvidiaApiKey: '',
      nvidiaModel: 'minimaxai/minimax-m3',
      alphaVantageKey: '',
      finnhubKey: '',
      dataProvider: 'simulated',
    };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {
    nvidiaApiKey: '',
    nvidiaModel: 'minimaxai/minimax-m3',
    alphaVantageKey: '',
    finnhubKey: '',
    dataProvider: 'simulated',
  };
}

/**
 * Ask the AI (NVIDIA MiniMax-M3) a question. Uses the key from localStorage.
 */
export async function askAI(
  prompt: string,
  options?: { systemPrompt?: string; maxTokens?: number; temperature?: number }
): Promise<string> {
  const config = getConfig();

  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-nvidia-key': config.nvidiaApiKey,
    },
    body: JSON.stringify({
      model: config.nvidiaModel,
      prompt,
      systemPrompt: options?.systemPrompt,
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
    }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'AI request failed');
  }
  return data.data.content as string;
}

/**
 * Test an NVIDIA API key without saving it.
 */
export async function testNvidiaKey(
  apiKey: string,
  model: string
): Promise<{ valid: boolean; message: string }> {
  const res = await fetch('/api/ai/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, model }),
  });
  const data = await res.json();
  return {
    valid: !!data.success,
    message: data.success ? data.data.message : data.error,
  };
}

/**
 * Fetch a real-time stock quote using the configured provider.
 */
export async function fetchQuote(symbol: string) {
  const config = getConfig();
  const res = await fetch(
    `/api/stocks/quote?symbol=${encodeURIComponent(symbol)}&provider=${config.dataProvider}`,
    {
      headers: {
        'x-finnhub-key': config.finnhubKey,
        'x-alphavantage-key': config.alphaVantageKey,
      },
    }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Quote fetch failed');
  return data.data;
}

export function hasAIKey(): boolean {
  return !!getConfig().nvidiaApiKey;
}

export function hasStockfitKey(): boolean {
  return !!getConfig().stockfitKey;
}

/**
 * Fetch company fundamentals from StockFit (SEC-filings based).
 * Returns the raw StockFit company details object (shape varies by tier).
 */
export async function fetchCompany(symbol: string): Promise<Record<string, any>> {
  const config = getConfig();
  const res = await fetch(`/api/company?symbol=${encodeURIComponent(symbol)}`, {
    headers: {
      'x-stockfit-key': config.stockfitKey,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Company lookup failed');
  return data.data as Record<string, any>;
}

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface NewsResult {
  articles: NewsArticle[];
  source: 'finnhub' | 'simulated';
  sentimentApplied: boolean;
  overall: string;
  summary: string;
}

/**
 * Fetch news with optional AI sentiment scoring. Uses the configured keys.
 */
export async function fetchNews(symbol = ''): Promise<NewsResult> {
  const config = getConfig();
  const params = new URLSearchParams();
  if (symbol) params.set('symbol', symbol);

  const res = await fetch(`/api/news?${params.toString()}`, {
    headers: {
      'x-finnhub-key': config.finnhubKey,
      'x-nvidia-key': config.nvidiaApiKey,
      'x-nvidia-model': config.nvidiaModel,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'News fetch failed');
  return data.data as NewsResult;
}
