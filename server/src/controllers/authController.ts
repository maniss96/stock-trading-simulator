import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;
    const { user, tokens } = await authService.register(username, email, password);

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          avatar: user.avatar,
        },
        ...tokens,
      },
      message: 'Registration successful',
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          avatar: user.avatar,
          totalProfitLoss: user.totalProfitLoss,
          totalTrades: user.totalTrades,
          winRate: user.winRate,
          rank: user.rank,
        },
        ...tokens,
      },
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token required' });
      return;
    }

    const tokens = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: tokens });
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    if (req.userId && refreshToken) {
      await authService.logout(req.userId, refreshToken);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  }

  async logoutAll(req: AuthRequest, res: Response): Promise<void> {
    if (req.userId) {
      await authService.logoutAll(req.userId);
    }
    res.json({ success: true, message: 'All sessions terminated' });
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    res.json({ success: true, data: req.user });
  }
}

export const authController = new AuthController();
