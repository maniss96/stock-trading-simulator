// =====================================================
// SHARED CONSTANTS - Stock Trading Simulator
// =====================================================

export const TRADING_CONSTANTS = {
  INITIAL_BALANCE: 100000, // $100,000 virtual starting funds
  MIN_ORDER_VALUE: 1,
  MAX_ORDER_VALUE: 1000000,
  COMMISSION_RATE: 0.001, // 0.1% per trade
  MIN_COMMISSION: 1.0,
  MAX_POSITION_SIZE: 0.25, // Max 25% of portfolio in single stock
  MARKET_OPEN_HOUR: 9,
  MARKET_OPEN_MINUTE: 30,
  MARKET_CLOSE_HOUR: 16,
  MARKET_CLOSE_MINUTE: 0,
  ORDER_EXPIRY_DAYS: 30,
} as const;

export const PREDICTION_CONSTANTS = {
  CONFIDENCE_THRESHOLD: 0.6,
  MIN_DATA_POINTS: 60, // Minimum historical data points for prediction
  LSTM_SEQUENCE_LENGTH: 30, // Days of data for LSTM input
  PREDICTION_UPDATE_INTERVAL: 3600000, // 1 hour in ms
  MODEL_RETRAIN_INTERVAL: 86400000, // 24 hours in ms
} as const;

export const LEADERBOARD_CONSTANTS = {
  PAGE_SIZE: 50,
  SCORE_WEIGHTS: {
    profitLoss: 0.35,
    winRate: 0.25,
    sharpeRatio: 0.20,
    consistency: 0.10,
    totalTrades: 0.10,
  },
  MIN_TRADES_FOR_RANKING: 10,
} as const;

export const SECURITY_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000, // 15 minutes
  RATE_LIMIT_WINDOW: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  BCRYPT_SALT_ROUNDS: 12,
} as const;

export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  STOCK_SYMBOL: /^[A-Z]{1,5}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

export const STOCK_SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Consumer Discretionary',
  'Consumer Staples',
  'Energy',
  'Industrials',
  'Materials',
  'Real Estate',
  'Utilities',
  'Communication Services',
] as const;

export const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
] as const;
