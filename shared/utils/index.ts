// =====================================================
// SHARED UTILITIES - Stock Trading Simulator
// =====================================================

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate Sharpe Ratio
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate = 0.02
): number {
  if (returns.length < 2) return 0;
  
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const annualizedReturn = avgReturn * 252; // Trading days in a year
  
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
    (returns.length - 1);
  const stdDev = Math.sqrt(variance) * Math.sqrt(252);
  
  if (stdDev === 0) return 0;
  return (annualizedReturn - riskFreeRate) / stdDev;
}

/**
 * Calculate Maximum Drawdown
 */
export function calculateMaxDrawdown(portfolioValues: number[]): number {
  if (portfolioValues.length < 2) return 0;
  
  let maxDrawdown = 0;
  let peak = portfolioValues[0];
  
  for (const value of portfolioValues) {
    if (value > peak) peak = value;
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  return maxDrawdown * 100; // Return as percentage
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter((c) => c > 0);
  const losses = recentChanges.filter((c) => c < 0).map((c) => Math.abs(c));
  
  const avgGain = gains.length > 0 ? gains.reduce((s, g) => s + g, 0) / period : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, l) => s + l, 0) / period : 0;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + p, 0) / period;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate MACD
 */
export function calculateMACD(prices: number[]): {
  value: number;
  signal: number;
  histogram: number;
} {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdValue = ema12 - ema26;
  
  // Simplified signal line calculation
  const signal = macdValue * 0.9; // Approximation
  const histogram = macdValue - signal;
  
  return { value: macdValue, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period = 20,
  stdDevMultiplier = 2
): { upper: number; middle: number; lower: number } {
  const middle = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  
  const variance =
    slice.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: middle + stdDevMultiplier * stdDev,
    middle,
    lower: middle - stdDevMultiplier * stdDev,
  };
}

/**
 * Validate stock symbol format
 */
export function isValidSymbol(symbol: string): boolean {
  return /^[A-Z]{1,5}$/.test(symbol);
}

/**
 * Check if market is open (US Eastern Time)
 */
export function isMarketOpen(): boolean {
  const now = new Date();
  const eastern = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  
  const day = eastern.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  const hours = eastern.getHours();
  const minutes = eastern.getMinutes();
  const time = hours * 60 + minutes;
  
  return time >= 9 * 60 + 30 && time < 16 * 60; // 9:30 AM - 4:00 PM
}

/**
 * Generate a random stock price movement (for simulation)
 */
export function simulatePriceMovement(
  currentPrice: number,
  volatility = 0.02
): number {
  const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
  return Math.max(0.01, currentPrice + change);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
