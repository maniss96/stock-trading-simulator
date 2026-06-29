# Deployment Guide

This guide covers deploying StockSim to **Vercel** (mobile-accessible) and explains the
required APIs and how real-time market data flows through the app.

---

## Architecture Overview

StockSim has two deployable parts:

| Part | What it does | Where to host |
|------|--------------|---------------|
| **`client/`** (Next.js) | The full UI + built-in serverless API routes for AI & quotes | **Vercel** |
| **`server/`** (Express) | Full trading engine, MongoDB persistence, auth, leaderboard | Railway / Render / Fly.io (optional) |

You can deploy **just the `client/` on Vercel** and the app works on your phone in
**Demo Mode** with:
- AI analysis (via your NVIDIA key, through `/api/ai`)
- Real-time quotes (via your Finnhub/Alpha Vantage key, through `/api/stocks/quote`)
- All pages, glassmorphism UI, and the API Keys manager

For persistent accounts, real order history, and the leaderboard across users, also
deploy the `server/` and set `NEXT_PUBLIC_API_URL`.

---

## Deploy the Frontend to Vercel (Phone-Accessible)

### Option A — Vercel Dashboard (easiest)

1. Push your code to GitHub (already done).
2. Go to [vercel.com/new](https://vercel.com/new) and import `maniss96/stock-trading-simulator`.
3. **Important:** Set the **Root Directory** to `client`.
   - Vercel will auto-detect Next.js.
4. (Optional) Add environment variables under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_API_URL` — only if you deployed the Express backend.
   - `NVIDIA_API_KEY`, `FINNHUB_API_KEY` — optional server-side fallbacks.
5. Click **Deploy**.
6. Open the generated `https://your-app.vercel.app` URL on your phone. Add it to your
   home screen for an app-like experience (PWA manifest is included).

### Option B — Vercel CLI

```bash
npm i -g vercel
cd client
vercel            # follow prompts, link project
vercel --prod     # production deploy
```

### After deploying
- Open the site on your phone.
- Tap **Try Demo** on the login page (no account/backend needed).
- Go to **API Keys** in the menu and paste your NVIDIA key → **Test Connection** → **Save**.
- Visit **AI Predictions** → use **Ask AI** for live analysis.

---

## Managing API Keys (in-app)

Navigate to **API Keys** (sidebar / mobile menu → "API Keys", route `/integrations`).

You can add and change keys at any time directly from the UI:
- **NVIDIA API Key** — powers the AI analysis (MiniMax-M3 and other models).
- **Finnhub / Alpha Vantage Key** — powers real-time stock quotes.

Keys are stored in your browser's local storage **on your device only**. They are sent
with each request and never persisted on the server.

---

## APIs You May Need

### 1. NVIDIA NIM (AI Analysis) — already integrated
- **Site:** https://build.nvidia.com/
- **Free tier:** Yes, with credits for hosted models.
- **Used for:** Natural-language market analysis, "Ask AI", portfolio review.
- **Models supported in-app:** MiniMax-M3, Llama 3.3 70B, Mixtral 8x22B, DeepSeek R1, Qwen 2.5.

### 2. Real-Time Stock Market Data (choose one)

| Provider | Free Tier | Real-Time | Best For | Get Key |
|----------|-----------|-----------|----------|---------|
| **Finnhub** | 60 calls/min | Yes | Recommended default | https://finnhub.io/register |
| **Alpha Vantage** | 25/day, 5/min | ~15min delay | Light usage | https://www.alphavantage.co/support/#api-key |
| **Simulated** | Unlimited | N/A (mock) | Testing/demo | No key needed |

### 3. Company Fundamentals (StockFit) — integrated
- **Site:** https://developer.stockfit.io/
- **Free tier:** Yes, no credit card.
- **What it is:** SEC-filings fundamentals — company profile, sector/industry, financials,
  ownership, earnings, ETF data. Powers the **Fundamentals** page (`/company`).
- **Important:** StockFit is **not** a real-time price feed. Use Finnhub / Alpha Vantage /
  the simulated provider for live quotes.

### 4. Optional Future Add-ons
- **Polygon.io** — institutional-grade market data (paid).
- **stockdata.org** — free real-time US quotes sourced from IEX (alternative to Finnhub).
- **Financial Modeling Prep** — fundamentals, financial statements.
- **NewsAPI / Finnhub News** — for AI sentiment analysis on headlines.
- **Twelve Data** — alternative real-time quotes + technical indicators.

---

## How Real-Time Trading Data Works

```
[ Your Phone / Browser ]
        |
        |  fetchQuote('AAPL')  (lib/ai.ts) — sends your key in request header
        v
[ Next.js Serverless Route ]  /api/stocks/quote
        |  picks provider based on your "API Keys" settings
        |
        +--> Finnhub      GET /quote?symbol=AAPL&token=KEY      (real-time)
        +--> Alpha Vantage GET /query?function=GLOBAL_QUOTE...  (delayed)
        +--> Simulated     deterministic mock price             (no key)
        |
        v
[ Normalized Quote JSON ] -> { price, change, changePercent, high, low, ... }
        |
        v
[ UI updates: dashboard, trading, predictions ]
```

**Polling vs. streaming:**
- The serverless route does **request/response polling** (call it on an interval, e.g.
  every 10–15s) — simple and works great on Vercel.
- For true push **streaming**, run the `server/` (Express + Socket.IO). It already emits
  `price:update` events over WebSocket. Finnhub also offers a WebSocket endpoint
  (`wss://ws.finnhub.io`) you can wire into the Express layer for live ticks.

**Recommended polling pattern (client):**
```ts
import { fetchQuote } from '@/lib/ai';

useEffect(() => {
  const id = setInterval(async () => {
    const q = await fetchQuote('AAPL');
    setPrice(q.price);
  }, 12000); // respect provider rate limits
  return () => clearInterval(id);
}, []);
```

> Tip: Finnhub's free tier (60/min) comfortably supports polling several symbols every
> 10–15 seconds. Alpha Vantage's 25/day limit is too low for live polling — use it for
> occasional lookups only.

---

## Deploy the Backend (optional, for full features)

The Express server needs MongoDB + (optionally) Redis. Easiest managed options:

### Railway / Render
1. Create a new service from the `server/` directory.
2. Add a MongoDB instance (MongoDB Atlas free tier works great).
3. Set environment variables from `server/.env.example` (use strong secrets!).
4. Deploy. Note the public URL (e.g. `https://stocksim-api.onrender.com`).
5. In Vercel, set `NEXT_PUBLIC_API_URL=https://stocksim-api.onrender.com/api`.
6. Add your Vercel domain to the server's `CORS_ORIGINS`.

### MongoDB Atlas (free database)
1. Create a free M0 cluster at https://www.mongodb.com/atlas.
2. Create a DB user + allow your host's IP (or 0.0.0.0/0 for testing).
3. Copy the connection string into `MONGODB_URI`.

---

## Security Reminders

- **Never commit real API keys.** Rotate any key that gets exposed.
- In-app keys live in the browser; for shared/public deployments prefer server-side env
  keys so they aren't visible in the client.
- Keep `NODE_ENV=production` and strong `JWT_SECRET`/`JWT_REFRESH_SECRET` on the backend.
- See [SECURITY.md](./SECURITY.md) for the full checklist.
