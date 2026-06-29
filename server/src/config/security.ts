/**
 * Security Configuration
 * Centralized security settings and policies
 */

export const securityConfig = {
  // Password Policy
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '@$!%*?&',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    bcryptRounds: 12,
  },

  // Token Configuration
  tokens: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    maxRefreshTokens: 5, // Max concurrent sessions
    tokenRotation: true, // Rotate refresh tokens on use
  },

  // Rate Limiting
  rateLimiting: {
    // General API rate limit
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    },
    // Auth endpoints (stricter)
    auth: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 10,
    },
    // Trading endpoints
    trading: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
    },
    // Search endpoints
    search: {
      windowMs: 60 * 1000,
      maxRequests: 20,
    },
  },

  // CORS Settings
  cors: {
    allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count', 'X-RateLimit-Remaining', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400, // 24 hours preflight cache
  },

  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
  },

  // Request Limits
  requests: {
    maxBodySize: '1mb',
    maxUrlLength: 2048,
    maxHeaderSize: 8192,
    requestTimeout: 30000, // 30 seconds
  },

  // Input Validation
  validation: {
    maxStringLength: 10000,
    maxArrayLength: 100,
    maxObjectDepth: 10,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },

  // Session Security
  session: {
    name: 'stocksim_session',
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // IP Blacklisting
  ipBlacklist: {
    enabled: true,
    maxViolations: 10,
    banDuration: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Audit Logging
  audit: {
    logAuthAttempts: true,
    logDataAccess: true,
    logAdminActions: true,
    retentionDays: 90,
  },
};

export default securityConfig;
