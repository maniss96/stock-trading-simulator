import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

/**
 * Helmet security headers
 * Protects against common web vulnerabilities
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", ...config.CORS_ORIGINS],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

/**
 * CORS configuration
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (config.CORS_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400, // 24 hours
});

/**
 * Rate limiting configurations
 */
export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const tradingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 trades per minute
  message: {
    success: false,
    error: 'Trading rate limit exceeded. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * HTTP Parameter Pollution protection
 */
export const hppProtection = hpp({
  whitelist: ['symbol', 'timeframe', 'sort', 'order'],
});

/**
 * Request size limiting
 */
export const requestSizeLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const MAX_BODY_SIZE = 1024 * 1024; // 1MB

  if (contentLength > MAX_BODY_SIZE) {
    res.status(413).json({
      success: false,
      error: 'Request body too large.',
    });
    return;
  }
  next();
};

/**
 * XSS Protection - sanitize request body
 */
export const xssProtection = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.query) {
    sanitizeObject(req.query);
  }
  if (req.params) {
    sanitizeObject(req.params);
  }
  next();
};

function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key] as string);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key] as Record<string, unknown>);
    }
  }
}

function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol in non-allowed contexts
    .trim();
}

/**
 * NoSQL Injection Prevention
 */
export const noSqlInjectionProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkForInjection = (obj: unknown): boolean => {
    if (typeof obj === 'string') {
      return obj.includes('$') && (obj.includes('{') || obj.includes('}'));
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key of Object.keys(obj as object)) {
        if (key.startsWith('$')) return true;
        if (checkForInjection((obj as Record<string, unknown>)[key])) return true;
      }
    }
    return false;
  };

  if (checkForInjection(req.body) || checkForInjection(req.query)) {
    logger.warn(`NoSQL injection attempt from IP: ${req.ip}`);
    res.status(400).json({
      success: false,
      error: 'Invalid request.',
    });
    return;
  }
  next();
};

/**
 * Request ID middleware for tracing
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = req.headers['x-request-id'] as string ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', id);
  next();
};
