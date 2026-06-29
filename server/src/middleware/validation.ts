import { body, param, query, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Handle validation results
 */
export const handleValidation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg,
      })),
    });
    return;
  }
  next();
};

/**
 * Registration validation rules
 */
export const registerValidation: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email is too long'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must include uppercase, lowercase, number, and special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * Login validation rules
 */
export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Invalid password'),
];

/**
 * Order placement validation
 */
export const orderValidation: ValidationChain[] = [
  body('symbol')
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('Symbol must be 1-5 characters')
    .matches(/^[A-Z]+$/)
    .withMessage('Symbol must be uppercase letters only'),
  body('side')
    .isIn(['BUY', 'SELL'])
    .withMessage('Side must be BUY or SELL'),
  body('type')
    .isIn(['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LIMIT'])
    .withMessage('Invalid order type'),
  body('quantity')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Quantity must be between 1 and 100,000'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('stopPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Stop price must be a positive number'),
];

/**
 * Stock symbol parameter validation
 */
export const symbolValidation: ValidationChain[] = [
  param('symbol')
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('Invalid stock symbol')
    .matches(/^[A-Z]+$/)
    .withMessage('Symbol must be uppercase letters only'),
];

/**
 * Pagination validation
 */
export const paginationValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Watchlist validation
 */
export const watchlistValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Watchlist name must be between 1 and 50 characters')
    .escape(),
  body('symbols')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Maximum 50 symbols per watchlist'),
  body('symbols.*')
    .optional()
    .matches(/^[A-Z]{1,5}$/)
    .withMessage('Invalid symbol format'),
];

/**
 * Prediction query validation
 */
export const predictionValidation: ValidationChain[] = [
  query('timeframe')
    .optional()
    .isIn(['1D', '1W', '1M', '3M'])
    .withMessage('Invalid timeframe'),
];
