# StockSim - AI-Powered Stock Trading Simulator

<div align="center">

![StockSim Banner](https://img.shields.io/badge/StockSim-AI%20Trading%20Simulator-6366f1?style=for-the-badge&logo=chart-line&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.x-FF6F00?style=flat-square&logo=tensorflow)](https://www.tensorflow.org/js)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

**A full-stack stock trading simulator with AI-powered market predictions, glassmorphism UI, and comprehensive security.**

[Features](#features) | [Tech Stack](#tech-stack) | [Quick Start](#quick-start) | [Architecture](#architecture) | [API Docs](#api-documentation) | [Contributing](#contributing)

</div>

---

## Overview

StockSim is an open-source stock trading simulator that allows users to practice trading with $100,000 in virtual funds. It features AI-powered market predictions using LSTM neural networks, real-time portfolio tracking, and a competitive leaderboard system — all wrapped in a stunning glassmorphism UI.

**Perfect for:**
- Learning stock trading without financial risk
- Understanding AI/ML in financial applications
- Studying full-stack application architecture
- Contributing to an open-source fintech project

---

## Features

### Trading Engine
- **Market Orders** — Execute trades at current market price
- **Limit Orders** — Set target price for automated execution
- **Stop-Loss Orders** — Protect against downside with automatic sells
- **Stop-Limit Orders** — Combined stop and limit functionality
- **Commission System** — 0.1% per trade (min $1.00) for realistic simulation
- **Position Limits** — Max 25% portfolio in single stock

### AI Prediction Engine
- **LSTM Neural Network** — Deep learning model for time series prediction
- **Ensemble Method** — Combines 5 prediction strategies:
  - Trend following (momentum-based)
  - Mean reversion
  - RSI-based prediction
  - MACD signal analysis
  - Bollinger Band mean reversion
- **Technical Indicators** — RSI, MACD, SMA, EMA, Bollinger Bands, Volume Analysis
- **Multiple Timeframes** — 1 Day, 1 Week, 1 Month, 3 Month predictions
- **Confidence Scoring** — Each prediction includes a confidence level (0-95%)
- **Signal Classification** — STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL

### Portfolio Management
- **Real-time Holdings Tracking** — Live P&L for all positions
- **Performance Metrics** — Sharpe Ratio, Max Drawdown, Win Rate
- **Portfolio History** — Daily snapshots with historical performance charts
- **Sector Allocation** — Visual breakdown of portfolio diversification
- **Transaction History** — Complete audit trail of all trades

### Leaderboard & Gamification
- **Composite Scoring** — Weighted formula (P&L 35%, Win Rate 25%, Sharpe 20%, Trades 10%, Consistency 10%)
- **Multiple Timeframes** — Daily, Weekly, Monthly, All-Time rankings
- **Minimum Trade Requirement** — 10 trades to qualify for leaderboard
- **Achievements System** — Unlock badges for trading milestones

### Security (Zero Tolerance)
- JWT with Refresh Token Rotation
- Bcrypt (12 rounds) Password Hashing
- Account Lockout (5 attempts → 15min lock)
- Helmet Security Headers (CSP, HSTS, etc.)
- Rate Limiting (General, Auth, Trading, Search)
- XSS / NoSQL Injection / Command Injection Prevention
- CSRF Protection (Double-submit cookie)
- HTTP Parameter Pollution Protection
- Request Size & Depth Limiting
- Input Sanitization & Validation
- Non-root Docker Containers

### UI/UX (Glassmorphism Design)
- **Frosted Glass Components** — Cards, buttons, inputs with blur effects
- **Animated Backgrounds** — Floating gradient orbs
- **Neon Accents** — Subtle glow effects for key elements
- **Responsive Design** — Mobile-first with collapsible sidebar
- **Dark Theme** — Eye-friendly for extended trading sessions
- **Framer Motion** — Smooth page transitions and micro-animations
- **Custom Scrollbar** — Themed to match the dark UI

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | SSR/CSR hybrid app |
| **Styling** | Tailwind CSS, Custom Glassmorphism | Dark theme UI system |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **State** | Zustand | Lightweight global state |
| **Backend** | Node.js, Express, TypeScript | REST API server |
| **Database** | MongoDB (Mongoose) | Document store for all data |
| **Cache** | Redis | Session cache, rate limiting |
| **AI/ML** | TensorFlow.js | LSTM prediction engine |
| **Auth** | JWT, Bcrypt | Token-based authentication |
| **Security** | Helmet, express-rate-limit, hpp | Multi-layer security |
| **Real-time** | Socket.IO | Live price updates |
| **Container** | Docker, Docker Compose | Deployment & orchestration |
| **Logging** | Winston | Structured application logging |

---

## Quick Start

### Prerequisites

- Node.js 18+ (recommended: 22)
- MongoDB 6+ (or Docker)
- Redis 7+ (or Docker)
- npm or pnpm

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/stock-trading-simulator.git
cd stock-trading-simulator

# Start all services
docker-compose up -d

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# Health Check: http://localhost:5000/api/health
```

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/stock-trading-simulator.git
cd stock-trading-simulator

# Install dependencies
npm install

# Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Edit server/.env with your MongoDB/Redis URIs and secrets

# Start development servers (requires MongoDB & Redis running)
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Environment Variables

See `server/.env.example` and `client/.env.example` for all configuration options.

**Critical for Production:**
- `JWT_SECRET` — Use a 64+ character random string
- `JWT_REFRESH_SECRET` — Different 64+ character random string
- `MONGODB_URI` — Authenticated MongoDB connection string
- `CORS_ORIGINS` — Your production frontend URL

---

## Architecture

```
stock-trading-simulator/
├── client/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── dashboard/    # Main trading dashboard
│   │   │   ├── trading/      # Stock trading interface
│   │   │   ├── portfolio/    # Portfolio management
│   │   │   ├── predictions/  # AI prediction viewer
│   │   │   ├── leaderboard/  # Competitive rankings
│   │   │   ├── analytics/    # Performance analytics
│   │   │   ├── learn/        # Learning center
│   │   │   ├── login/        # Authentication
│   │   │   └── register/     # Registration
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/           # Glassmorphism UI kit
│   │   │   └── layout/       # Navbar, Sidebar, Layout
│   │   ├── lib/              # Utilities, API, Store
│   │   └── styles/           # Global CSS & design system
│   ├── Dockerfile
│   └── package.json
├── server/                    # Express Backend
│   ├── src/
│   │   ├── ai/              # AI Prediction Engine
│   │   ├── config/          # Environment, DB, Security
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, Security, Validation
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   └── utils/           # Logger, helpers
│   ├── Dockerfile
│   └── package.json
├── shared/                    # Shared code
│   ├── types/                # TypeScript interfaces
│   ├── constants/            # App-wide constants
│   └── utils/                # Shared utilities
├── docker-compose.yml         # Full stack orchestration
├── SECURITY.md               # Security documentation
└── CONTRIBUTING.md           # Contribution guide
```

---

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/profile` | Get user profile |

### Stocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks` | List all stocks |
| GET | `/api/stocks/search?q=` | Search stocks |
| GET | `/api/stocks/:symbol` | Get stock details |
| GET | `/api/stocks/:symbol/history` | Historical price data |
| GET | `/api/stocks/:symbol/prediction` | AI prediction |
| GET | `/api/stocks/predictions` | All predictions |

### Trading

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trading/orders` | Place order |
| DELETE | `/api/trading/orders/:id` | Cancel order |
| GET | `/api/trading/orders` | Order history |

### Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Portfolio summary |
| GET | `/api/portfolio/performance` | Performance metrics |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Rankings |
| GET | `/api/leaderboard/my-rank` | User's rank |

---

## Open Source Focus

This project is designed to be extensible. Here are great areas to contribute:

### Adding Market Indicators
- Implement Fibonacci retracement levels
- Add Average True Range (ATR)
- Create On-Balance Volume (OBV) indicator
- Implement Ichimoku Cloud

### More Data Sources
- Yahoo Finance API integration
- Finnhub real-time data
- Polygon.io market data
- News sentiment analysis (NLP)

### Trading Algorithms
- Moving Average Crossover strategy
- Mean Reversion algorithm
- Pairs Trading implementation
- Momentum-based auto-trading

### AI Improvements
- Implement actual TensorFlow.js LSTM training pipeline
- Add sentiment analysis from news feeds
- Multi-variate prediction (volume, social, macro data)
- Reinforcement learning trading agent

---

## Learning Path

This project covers several key learning areas:

1. **AI for Trend Prediction** — Understanding LSTM networks, technical indicators, and ensemble methods for financial prediction
2. **Financial Data Handling** — Working with time series data, calculating financial metrics, and handling market data feeds
3. **Performance Analytics** — Computing Sharpe ratios, drawdowns, win rates, and building performance dashboards
4. **Security Engineering** — Implementing defense-in-depth with multiple security layers
5. **Full-Stack Architecture** — Building scalable applications with proper separation of concerns

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with modern web technologies for the open-source community.**

If you find this project useful, please give it a star!

</div>
