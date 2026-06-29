import { NextRequest, NextResponse } from 'next/server';

/**
 * Real-time stock quote proxy. Supports multiple data providers based on the
 * keys/provider the user configures on the API Keys page.
 *
 * Providers:
 *  - finnhub      -> https://finnhub.io  (real-time, generous free tier)
 *  - alphavantage -> https://www.alphavantage.co (free tier: 25 req/day)
 *  - simulated    -> returns a deterministic mock quote (no key needed)
 */

export const runtime = 'edge';

interface Quote {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get('symbol') || '').toUpperCase();
  const provider = searchParams.get('provider') || 'simulated';

  const finnhubKey = req.headers.get('x-finnhub-key') || process.env.FINNHUB_API_KEY || '';
  const alphaKey = req.headers.get('x-alphavantage-key') || process.env.ALPHA_VANTAGE_API_KEY || '';
  const stockdataKey = req.headers.get('x-stockdata-key') || process.env.STOCKDATA_API_KEY || '';

  if (!symbol || !/^[A-Z.]{1,6}$/.test(symbol)) {
    return NextResponse.json({ success: false, error: 'Valid symbol required' }, { status: 400 });
  }

  try {
    if (provider === 'finnhub' && finnhubKey) {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`
      );
      const d = await res.json();
      // Finnhub: c=current, d=change, dp=percent, h=high, l=low, o=open, pc=prevClose
      if (d && typeof d.c === 'number' && d.c > 0) {
        const quote: Quote = {
          symbol,
          price: d.c,
          change: d.d ?? 0,
          changePercent: d.dp ?? 0,
          high: d.h ?? d.c,
          low: d.l ?? d.c,
          open: d.o ?? d.c,
          previousClose: d.pc ?? d.c,
          provider: 'finnhub',
        };
        return NextResponse.json({ success: true, data: quote });
      }
      return NextResponse.json(
        { success: false, error: 'No data from Finnhub (check key or symbol)' },
        { status: 502 }
      );
    }

    if (provider === 'stockdata' && stockdataKey) {
      const res = await fetch(
        `https://api.stockdata.org/v1/data/quote?symbols=${symbol}&api_token=${stockdataKey}`
      );
      const d = await res.json();
      const row = Array.isArray(d?.data) ? d.data[0] : null;
      if (row && typeof row.price === 'number') {
        const prev =
          typeof row.previous_close_price === 'number' ? row.previous_close_price : row.price;
        const change = parseFloat((row.price - prev).toFixed(2));
        // stockdata's day_change is a percentage; fall back to a computed value
        const changePercent =
          typeof row.day_change === 'number'
            ? row.day_change
            : prev > 0
            ? parseFloat(((change / prev) * 100).toFixed(2))
            : 0;
        const quote: Quote = {
          symbol,
          price: row.price,
          change,
          changePercent,
          high: row.day_high ?? row.price,
          low: row.day_low ?? row.price,
          open: row.day_open ?? row.price,
          previousClose: prev,
          provider: 'stockdata',
        };
        return NextResponse.json({ success: true, data: quote });
      }
      return NextResponse.json(
        { success: false, error: 'No data from stockdata.org (check key or symbol)' },
        { status: 502 }
      );
    }

    if (provider === 'alphavantage' && alphaKey) {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaKey}`
      );
      const d = await res.json();
      const q = d?.['Global Quote'];
      if (q && q['05. price']) {
        const price = parseFloat(q['05. price']);
        const prev = parseFloat(q['08. previous close']) || price;
        const quote: Quote = {
          symbol,
          price,
          change: parseFloat(q['09. change']) || 0,
          changePercent: parseFloat((q['10. change percent'] || '0').replace('%', '')) || 0,
          high: parseFloat(q['03. high']) || price,
          low: parseFloat(q['04. low']) || price,
          open: parseFloat(q['02. open']) || price,
          previousClose: prev,
          provider: 'alphavantage',
        };
        return NextResponse.json({ success: true, data: quote });
      }
      return NextResponse.json(
        { success: false, error: 'No data from Alpha Vantage (rate limit or invalid symbol)' },
        { status: 502 }
      );
    }

    // Fallback: deterministic simulated quote
    const seed = symbol.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const base = 50 + (seed % 400);
    const drift = Math.sin(Date.now() / 60000 + seed) * (base * 0.02);
    const price = parseFloat((base + drift).toFixed(2));
    const previousClose = base;
    const change = parseFloat((price - previousClose).toFixed(2));
    const quote: Quote = {
      symbol,
      price,
      change,
      changePercent: parseFloat(((change / previousClose) * 100).toFixed(2)),
      high: parseFloat((price * 1.015).toFixed(2)),
      low: parseFloat((price * 0.985).toFixed(2)),
      open: previousClose,
      previousClose,
      provider: 'simulated',
    };
    return NextResponse.json({ success: true, data: quote });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
