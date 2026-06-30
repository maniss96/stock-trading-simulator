import { NextRequest, NextResponse } from 'next/server';

/**
 * News + AI sentiment route.
 *
 * 1. Fetches news from Finnhub (company news if `symbol` given, else general market).
 *    Falls back to a small set of simulated headlines when no Finnhub key is set.
 * 2. If an NVIDIA key is provided, runs AI sentiment scoring over the headlines
 *    (overall sentiment + per-article classification).
 *
 * Keys are passed via headers from the client (x-finnhub-key, x-nvidia-key)
 * and are never persisted server-side.
 */

export const runtime = 'edge';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

const SIMULATED_NEWS: NewsArticle[] = [
  {
    id: 'sim-1',
    headline: 'Tech stocks rally as AI optimism drives market gains',
    summary: 'Major technology companies saw strong gains amid renewed enthusiasm for artificial intelligence applications across industries.',
    source: 'Demo Wire',
    url: '#',
    datetime: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    id: 'sim-2',
    headline: 'Federal Reserve signals cautious approach on interest rates',
    summary: 'Policymakers indicated a data-dependent stance, keeping markets watchful for upcoming inflation reports.',
    source: 'Demo Wire',
    url: '#',
    datetime: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    id: 'sim-3',
    headline: 'Semiconductor demand surges on data center expansion',
    summary: 'Chipmakers report robust orders as cloud providers accelerate infrastructure buildouts.',
    source: 'Demo Wire',
    url: '#',
    datetime: Math.floor(Date.now() / 1000) - 10800,
  },
  {
    id: 'sim-4',
    headline: 'Energy sector faces pressure amid shifting commodity prices',
    summary: 'Oil and gas companies navigate volatility as global supply dynamics evolve.',
    source: 'Demo Wire',
    url: '#',
    datetime: Math.floor(Date.now() / 1000) - 14400,
  },
  {
    id: 'sim-5',
    headline: 'Retail earnings beat expectations on resilient consumer spending',
    summary: 'Several major retailers posted better-than-expected quarterly results, easing recession concerns.',
    source: 'Demo Wire',
    url: '#',
    datetime: Math.floor(Date.now() / 1000) - 18000,
  },
];

async function fetchFinnhubNews(symbol: string, finnhubKey: string): Promise<NewsArticle[]> {
  let url: string;
  if (symbol) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 14);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fmt(from)}&to=${fmt(to)}&token=${finnhubKey}`;
  } else {
    url = `https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error('Finnhub news fetch failed');
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.slice(0, 12).map((a: any, i: number) => ({
    id: String(a.id ?? i),
    headline: a.headline ?? '',
    summary: a.summary ?? '',
    source: a.source ?? 'Unknown',
    url: a.url ?? '#',
    datetime: a.datetime ?? Math.floor(Date.now() / 1000),
    image: a.image || undefined,
  }));
}

async function analyzeSentiment(
  articles: NewsArticle[],
  nvidiaKey: string,
  model: string
): Promise<{ articles: NewsArticle[]; overall: string; summary: string }> {
  const headlines = articles
    .map((a, i) => `${i + 1}. ${a.headline}`)
    .join('\n');

  const res = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${nvidiaKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a financial news sentiment analyst. Classify each headline as positive, negative, or neutral for investors. Respond ONLY in valid JSON: { "sentiments": ("positive"|"negative"|"neutral")[], "overall": "positive"|"negative"|"neutral", "summary": string }. The sentiments array must match the number of headlines in order. Keep summary under 60 words.',
        },
        {
          role: 'user',
          content: `Analyze sentiment for these ${articles.length} market headlines:\n${headlines}`,
        },
      ],
      max_tokens: 800,
      temperature: 0.2,
      stream: false,
    }),
  });

  if (!res.ok) {
    return { articles, overall: 'neutral', summary: 'Sentiment analysis unavailable.' };
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';

  try {
    // Extract JSON (model may wrap it in prose/code fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    const sentiments: string[] = parsed.sentiments || [];
    const withSentiment = articles.map((a, i) => ({
      ...a,
      sentiment: (sentiments[i] as NewsArticle['sentiment']) || 'neutral',
    }));
    return {
      articles: withSentiment,
      overall: parsed.overall || 'neutral',
      summary: parsed.summary || '',
    };
  } catch {
    return { articles, overall: 'neutral', summary: 'Could not parse sentiment.' };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get('symbol') || '').toUpperCase();
  const withSentiment = searchParams.get('sentiment') !== 'false';

  const finnhubKey = req.headers.get('x-finnhub-key') || process.env.FINNHUB_API_KEY || '';
  const nvidiaKey = req.headers.get('x-nvidia-key') || process.env.NVIDIA_API_KEY || '';
  const nvidiaModel = req.headers.get('x-nvidia-model') || 'minimaxai/minimax-m3';

  try {
    let articles: NewsArticle[];
    let source: 'finnhub' | 'simulated' = 'simulated';

    if (finnhubKey) {
      try {
        articles = await fetchFinnhubNews(symbol, finnhubKey);
        source = 'finnhub';
        if (articles.length === 0) {
          articles = SIMULATED_NEWS;
          source = 'simulated';
        }
      } catch {
        articles = SIMULATED_NEWS;
      }
    } else {
      articles = SIMULATED_NEWS;
    }

    let overall = '';
    let summary = '';
    let sentimentApplied = false;

    if (withSentiment && nvidiaKey && articles.length > 0) {
      const result = await analyzeSentiment(articles.slice(0, 10), nvidiaKey, nvidiaModel);
      articles = result.articles.concat(articles.slice(10));
      overall = result.overall;
      summary = result.summary;
      sentimentApplied = true;
    }

    return NextResponse.json({
      success: true,
      data: {
        articles,
        source,
        sentimentApplied,
        overall,
        summary,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
