import { Response } from 'express';
import { tradingService } from '../services/tradingService';
import { AuthRequest } from '../middleware/auth';

export class TradingController {
  async placeOrder(req: AuthRequest, res: Response): Promise<void> {
    const { symbol, side, type, quantity, price, stopPrice } = req.body;

    const order = await tradingService.placeOrder({
      userId: req.userId!,
      symbol,
      side,
      type,
      quantity,
      price,
      stopPrice,
    });

    res.status(201).json({
      success: true,
      data: order,
      message: `${side} order for ${quantity} shares of ${symbol} placed successfully`,
    });
  }

  async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const order = await tradingService.cancelOrder(orderId, req.userId!);

    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    });
  }

  async getOrders(req: AuthRequest, res: Response): Promise<void> {
    const { status, page = '1', limit = '20' } = req.query;

    const result = await tradingService.getOrders(
      req.userId!,
      status as string | undefined,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    res.json({
      success: true,
      data: result.orders,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit as string, 10)),
      },
    });
  }
}

export const tradingController = new TradingController();
