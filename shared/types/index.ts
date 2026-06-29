// =====================================================
// SHARED TYPES - Stock Trading Simulator
// =====================================================

// ============ USER TYPES ============
export interface IUser {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  balance: number;
  initialBalance: number;
  totalProfitLoss: number;
  totalTrades: number;
  winRate: number;
  rank: number;
  achievements: IAchievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  _id: string;
  username: string;
  avatar?: string;
  balance: number;
  totalProfitLoss: number;
  totalTrades: number;
  winRate: number;
  rank: number;
  achievements: IAchievement[];
}

export interface IAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  icon: string;
}

// ============ STOCK TYPES ============
export interface IStock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  peRatio?: number;
  dividendYield?: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface IStockHistorical {
  symbol: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface IStockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

// ============ TRADING TYPES ============
export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LIMIT = 'STOP_LIMIT',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface IOrder {
  _id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  filledQuantity: number;
  filledPrice?: number;
  status: OrderStatus;
  commission: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface ITransaction {
  _id: string;
  userId: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  total: number;
  commission: number;
  profitLoss?: number;
  balanceAfter: number;
  createdAt: Date;
}

// ============ PORTFOLIO TYPES ============
export interface IPortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface IPortfolio {
  userId: string;
  holdings: IPortfolioHolding[];
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  cashBalance: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface IPortfolioHistory {
  userId: string;
  date: Date;
  totalValue: number;
  cashBalance: number;
  holdingsValue: number;
}

// ============ PREDICTION TYPES ============
export enum PredictionTimeframe {
  ONE_DAY = '1D',
  ONE_WEEK = '1W',
  ONE_MONTH = '1M',
  THREE_MONTHS = '3M',
}

export enum PredictionSignal {
  STRONG_BUY = 'STRONG_BUY',
  BUY = 'BUY',
  HOLD = 'HOLD',
  SELL = 'SELL',
  STRONG_SELL = 'STRONG_SELL',
}

export interface IPrediction {
  _id: string;
  symbol: string;
  timeframe: PredictionTimeframe;
  signal: PredictionSignal;
  predictedPrice: number;
  currentPrice: number;
  confidence: number;
  indicators: ITechnicalIndicators;
  createdAt: Date;
  expiresAt: Date;
}

export interface ITechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    ema12: number;
    ema26: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: {
    current: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

// ============ LEADERBOARD TYPES ============
export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  totalProfitLoss: number;
  profitLossPercent: number;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  score: number;
}

export enum LeaderboardTimeframe {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME',
}

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ AUTH TYPES ============
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IAuthResponse {
  user: IUserPublic;
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

// ============ WATCHLIST TYPES ============
export interface IWatchlist {
  _id: string;
  userId: string;
  name: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}
