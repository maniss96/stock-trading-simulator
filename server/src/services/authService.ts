import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { User, IUserDocument } from '../models/User';
import { Portfolio } from '../models/Portfolio';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserPayload {
  userId: string;
  email: string;
  username: string;
}

class AuthService {
  /**
   * Generate access and refresh tokens
   */
  generateTokens(payload: UserPayload): AuthTokens {
    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRY,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRY,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new ApiError(409, 'Email already registered');
      }
      throw new ApiError(409, 'Username already taken');
    }

    // Create user
    const user = new User({
      username,
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
      balance: 100000,
      initialBalance: 100000,
    });

    await user.save();

    // Create empty portfolio for user
    await Portfolio.create({ userId: user._id, holdings: [] });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    // Store refresh token
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
    });

    logger.info(`New user registered: ${username}`);
    return { user, tokens };
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash +refreshTokens +loginAttempts +lockUntil'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockTimeRemaining = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      throw new ApiError(
        423,
        `Account locked. Try again in ${lockTimeRemaining} minutes.`
      );
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      throw new ApiError(401, 'Invalid email or password');
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    // Store refresh token (keep max 5 sessions)
    const refreshTokens = user.refreshTokens || [];
    if (refreshTokens.length >= 5) {
      refreshTokens.shift(); // Remove oldest
    }
    refreshTokens.push(tokens.refreshToken);

    await User.findByIdAndUpdate(user._id, { refreshTokens });

    logger.info(`User logged in: ${user.username}`);
    return { user, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as UserPayload;

      const user = await User.findById(decoded.userId).select('+refreshTokens');
      if (!user) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Check if refresh token exists in user's stored tokens
      if (!user.refreshTokens?.includes(refreshToken)) {
        // Possible token reuse attack - invalidate all tokens
        await User.findByIdAndUpdate(user._id, { refreshTokens: [] });
        logger.warn(`Potential token reuse attack for user: ${user.username}`);
        throw new ApiError(401, 'Refresh token has been revoked');
      }

      // Generate new tokens
      const newTokens = this.generateTokens({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });

      // Rotate refresh token (remove old, add new)
      await User.findByIdAndUpdate(user._id, {
        $pull: { refreshTokens: refreshToken },
        $push: { refreshTokens: newTokens.refreshToken },
      });

      return newTokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
    logger.info(`User logged out: ${userId}`);
  }

  /**
   * Logout all sessions
   */
  async logoutAll(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokens: [] });
    logger.info(`All sessions logged out for user: ${userId}`);
  }
}

export const authService = new AuthService();
