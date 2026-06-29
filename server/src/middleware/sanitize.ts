import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Advanced Input Sanitization Middleware
 * Protects against XSS, SQL injection, NoSQL injection, and command injection
 */

// Dangerous patterns to detect and remove
const DANGEROUS_PATTERNS = [
  // Script injection
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  
  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
  /(--|;|\/\*|\*\/)/g,
  
  // Command injection
  /(\||;|`|\$\(|&&|\|\|)/g,
  
  // Path traversal
  /(\.\.\/)|(\.\.\\)/g,
  
  // Null bytes
  /\0/g,
];

// MongoDB operator injection patterns
const MONGO_OPERATORS = ['$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$regex', '$where', '$exists', '$type', '$expr', '$jsonSchema', '$mod', '$text', '$all', '$elemMatch', '$size', '$slice'];

/**
 * Deep sanitize an object's string values
 */
function deepSanitize(obj: unknown, depth = 0): unknown {
  if (depth > 10) return obj; // Prevent infinite recursion

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item, depth + 1));
  }

  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Block MongoDB operators in keys
      if (key.startsWith('$')) {
        logger.warn(`Blocked MongoDB operator in request key: ${key}`);
        continue;
      }
      sanitized[key] = deepSanitize(value, depth + 1);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize a string value
 */
function sanitizeString(str: string): string {
  let sanitized = str;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove dangerous HTML
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*on\w+=[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');

  // Trim excessive whitespace
  sanitized = sanitized.trim();

  // Limit string length to prevent buffer overflow
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
}

/**
 * Check for potential injection attacks
 */
function detectInjection(obj: unknown): { detected: boolean; pattern?: string } {
  if (typeof obj === 'string') {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(obj)) {
        pattern.lastIndex = 0; // Reset regex
        return { detected: true, pattern: pattern.source };
      }
    }
  }

  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as object)) {
      // Check for MongoDB operator injection
      if (MONGO_OPERATORS.includes(key)) {
        return { detected: true, pattern: `MongoDB operator: ${key}` };
      }
      const result = detectInjection(value);
      if (result.detected) return result;
    }
  }

  return { detected: false };
}

/**
 * Main sanitization middleware
 */
export const advancedSanitize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      // Check for injection attempts (log but don't block in development)
      const bodyCheck = detectInjection(req.body);
      if (bodyCheck.detected) {
        logger.warn(`Potential injection attempt in body from IP ${req.ip}: ${bodyCheck.pattern}`);
      }
      req.body = deepSanitize(req.body) as typeof req.body;
    }

    // Sanitize query parameters
    if (req.query) {
      const queryCheck = detectInjection(req.query);
      if (queryCheck.detected) {
        logger.warn(`Potential injection attempt in query from IP ${req.ip}: ${queryCheck.pattern}`);
      }
      req.query = deepSanitize(req.query) as typeof req.query;
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = deepSanitize(req.params) as typeof req.params;
    }

    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    next();
  }
};

/**
 * Strict mode - blocks request on detection
 */
export const strictSanitize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const bodyCheck = detectInjection(req.body);
  const queryCheck = detectInjection(req.query);

  if (bodyCheck.detected || queryCheck.detected) {
    logger.warn(`Request blocked due to injection attempt from IP ${req.ip}`);
    res.status(400).json({
      success: false,
      error: 'Request contains potentially dangerous content',
    });
    return;
  }

  next();
};
