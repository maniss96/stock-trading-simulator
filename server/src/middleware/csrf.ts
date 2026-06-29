import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * CSRF Protection Middleware
 * Uses double-submit cookie pattern for SPA compatibility
 */

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
function generateToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Set CSRF token cookie on the response
 */
export const setCsrfToken = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = generateToken();

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JS for double-submit
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
    path: '/',
  });

  // Also expose via header for initial page load
  res.setHeader('X-CSRF-Token', token);
  next();
};

/**
 * Validate CSRF token on state-changing requests
 */
export const validateCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API routes that use Bearer token auth
  // (Bearer token auth is already immune to CSRF attacks)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;

  if (!cookieToken || !headerToken) {
    logger.warn(`CSRF validation failed - missing tokens from IP: ${req.ip}`);
    res.status(403).json({
      success: false,
      error: 'CSRF token missing',
    });
    return;
  }

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(
    Buffer.from(cookieToken, 'utf8'),
    Buffer.from(headerToken, 'utf8')
  )) {
    logger.warn(`CSRF validation failed - token mismatch from IP: ${req.ip}`);
    res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
    });
    return;
  }

  next();
};
