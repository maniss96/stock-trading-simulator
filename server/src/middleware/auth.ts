import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { User, IUserDocument } from '../models/User';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: IUserDocument;
  userId?: string;
}

/**
 * Authenticate JWT token middleware
 * Validates access token and attaches user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format.',
      });
      return;
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
    };

    const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.',
      });
      return;
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      res.status(423).json({
        success: false,
        error: 'Account is temporarily locked. Please try again later.',
      });
      return;
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired. Please refresh your token.',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens');
      if (user) {
        req.user = user;
        req.userId = decoded.userId;
      }
    }
  } catch {
    // Silently continue without auth
  }
  next();
};
