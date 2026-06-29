import { NextRequest, NextResponse } from 'next/server';

/**
 * StockFit company fundamentals route.
 *
 * StockFit (api.stockfit.io) is a *fundamentals* API sourced from SEC filings —
 * company profile, financials, ownership, earnings, etc. It is NOT a real-time
 * price feed, so it complements (does not replace) the quote providers.
 *
 * Uses the official @stockfit/api SDK. Runs on the Node.js runtime (not edge)
 * because the SDK is a Node package.
 *
 * The token is supplied by the client via the `x-stockfit-key` header (from the
 * in-app API Keys page) and is never persisted server-side.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get('symbol') || '').toUpperCase();
  const token = req.headers.get('x-stockfit-key') || process.env.STOCKFIT_API_KEY || '';

  if (!symbol || !/^[A-Z.]{1,6}$/.test(symbol)) {
    return NextResponse.json(
      { success: false, error: 'A valid symbol is required' },
      { status: 400 }
    );
  }

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'No StockFit API key configured. Add one on the API Keys page.',
      },
      { status: 400 }
    );
  }

  try {
    // Dynamic import keeps the SDK out of the edge bundle and isolates failures.
    const { createClient, companyDetails } = await import('@stockfit/api');

    createClient({ token });

    const { data } = await companyDetails({ query: { symbol } });

    if (!data) {
      return NextResponse.json(
        { success: false, error: `No fundamentals found for ${symbol}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'StockFit request failed';
    // Surface auth issues clearly
    const isAuth = /401|unauthor|forbidden|invalid/i.test(message);
    return NextResponse.json(
      {
        success: false,
        error: isAuth ? 'Invalid StockFit API key' : message,
      },
      { status: isAuth ? 401 : 502 }
    );
  }
}
