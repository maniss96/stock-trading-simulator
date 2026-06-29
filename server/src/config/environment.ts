import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  REDIS_URL: string;
  CORS_ORIGINS: string[];
  STOCK_API_KEY: string;
  STOCK_API_BASE_URL: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  BCRYPT_SALT_ROUNDS: number;
  LOG_LEVEL: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const config: EnvironmentConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 5000),
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/stock-trading-simulator'),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
  JWT_ACCESS_EXPIRY: getEnvVar('JWT_ACCESS_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: getEnvVar('JWT_REFRESH_EXPIRY', '7d'),
  REDIS_URL: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  CORS_ORIGINS: (getEnvVar('CORS_ORIGINS', 'http://localhost:3000')).split(','),
  STOCK_API_KEY: getEnvVar('STOCK_API_KEY', 'demo'),
  STOCK_API_BASE_URL: getEnvVar('STOCK_API_BASE_URL', 'https://www.alphavantage.co/query'),
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  BCRYPT_SALT_ROUNDS: getEnvNumber('BCRYPT_SALT_ROUNDS', 12),
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
};

export default config;
