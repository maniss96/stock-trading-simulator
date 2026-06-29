import { User } from '../models/User';
import { Order, IOrderDocument } from '../models/Order';
import { Transaction } from '../models/Transaction';
import { Portfolio } from '../models/Portfolio';
import { Stock } from '../models/Stock';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface PlaceOrderInput {
  userId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
}

class TradingService {
  private readonly COMMISSION_RATE = 0.001; // 0.1%
  private readonly MIN_COMMISSION = 1.0;

  /**
   * Place a new order
   */
  async placeOrder(input: PlaceOrderInput): Promise<IOrderDocument> {
    const { userId, symbol, side, type, quantity, price, stopPrice } = input;

    // Get stock data
    const stock = await Stock.findOne({ symbol });
    if (!stock) {
      throw new ApiError(404, `Stock ${symbol} not found`);
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const executionPrice = type === 'MARKET' ? stock.currentPrice : (price || stock.currentPrice);

    // Validate order
    if (side === 'BUY') {
      const totalCost = executionPrice * quantity;
      const commission = this.calculateCommission(totalCost);

      if (user.balance < totalCost + commission) {
        throw new ApiError(400, `Insufficient funds. Required: $${(totalCost + commission).toFixed(2)}, Available: $${user.balance.toFixed(2)}`);
      }
    } else {
      // SELL - check holdings
      const portfolio = await Portfolio.findOne({ userId });
      const holding = portfolio?.holdings.find((h) => h.symbol === symbol);

      if (!holding || holding.quantity < quantity) {
        throw new ApiError(400, `Insufficient shares. You own ${holding?.quantity || 0} shares of ${symbol}`);
      }
    }

    // Create order
    const order = new Order({
      userId,
      symbol,
      side,
      type,
      quantity,
      price,
      stopPrice,
      status: 'PENDING',
      expiresAt: type !== 'MARKET' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
    });

    await order.save();

    // Execute market orders immediately
    if (type === 'MARKET') {
      await this.executeOrder(order, stock.currentPrice);
    }

    return order;
  }

  /**
   * Execute an order at the given price
   */
  async executeOrder(order: IOrderDocument, executionPrice: number): Promise<void> {
    const total = executionPrice * order.quantity;
    const commission = this.calculateCommission(total);

    const user = await User.findById(order.userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (order.side === 'BUY') {
      // Deduct from balance
      if (user.balance < total + commission) {
        order.status = 'REJECTED';
        await order.save();
        throw new ApiError(400, 'Insufficient funds at execution time');
      }

      user.balance -= (total + commission);
      await user.save();

      // Update portfolio
      await this.updatePortfolioOnBuy(
        order.userId.toString(),
        order.symbol,
        order.quantity,
        executionPrice
      );
    } else {
      // SELL - credit balance
      const profitLoss = await this.calculateProfitLoss(
        order.userId.toString(),
        order.symbol,
        order.quantity,
        executionPrice
      );

      user.balance += (total - commission);
      user.totalProfitLoss += profitLoss;
      user.totalTrades += 1;

      if (profitLoss > 0) {
        user.winningTrades += 1;
      } else if (profitLoss < 0) {
        user.losingTrades += 1;
      }

      user.winRate = user.totalTrades > 0
        ? (user.winningTrades / user.totalTrades) * 100
        : 0;

      await user.save();

      // Update portfolio
      await this.updatePortfolioOnSell(
        order.userId.toString(),
        order.symbol,
        order.quantity
      );
    }

    // Update order status
    order.filledQuantity = order.quantity;
    order.filledPrice = executionPrice;
    order.commission = commission;
    order.status = 'FILLED';
    await order.save();

    // Create transaction record
    const updatedUser = await User.findById(order.userId);
    await Transaction.create({
      userId: order.userId,
      orderId: order._id,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: executionPrice,
      total,
      commission,
      profitLoss: order.side === 'SELL' ? await this.calculateProfitLoss(
        order.userId.toString(), order.symbol, order.quantity, executionPrice
      ) : undefined,
      balanceAfter: updatedUser?.balance || 0,
    });

    logger.info(`Order executed: ${order.side} ${order.quantity} ${order.symbol} @ $${executionPrice}`);
  }

  /**
   * Cancel a pending order
   */
  async cancelOrder(orderId: string, userId: string): Promise<IOrderDocument> {
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: 'PENDING',
    });

    if (!order) {
      throw new ApiError(404, 'Order not found or cannot be cancelled');
    }

    order.status = 'CANCELLED';
    await order.save();

    logger.info(`Order cancelled: ${orderId}`);
    return order;
  }

  /**
   * Get user's order history
   */
  async getOrders(
    userId: string,
    status?: string,
    page = 1,
    limit = 20
  ): Promise<{ orders: IOrderDocument[]; total: number }> {
    const filter: Record<string, unknown> = { userId };
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { orders, total };
  }

  /**
   * Update portfolio on buy
   */
  private async updatePortfolioOnBuy(
    userId: string,
    symbol: string,
    quantity: number,
    price: number
  ): Promise<void> {
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      await Portfolio.create({
        userId,
        holdings: [{ symbol, quantity, averageCost: price, totalInvested: price * quantity }],
      });
      return;
    }

    const holdingIndex = portfolio.holdings.findIndex((h) => h.symbol === symbol);

    if (holdingIndex >= 0) {
      const holding = portfolio.holdings[holdingIndex];
      const totalShares = holding.quantity + quantity;
      const totalCost = holding.averageCost * holding.quantity + price * quantity;
      holding.averageCost = totalCost / totalShares;
      holding.quantity = totalShares;
      holding.totalInvested = totalCost;
    } else {
      portfolio.holdings.push({
        symbol,
        quantity,
        averageCost: price,
        totalInvested: price * quantity,
      });
    }

    await portfolio.save();
  }

  /**
   * Update portfolio on sell
   */
  private async updatePortfolioOnSell(
    userId: string,
    symbol: string,
    quantity: number
  ): Promise<void> {
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) return;

    const holdingIndex = portfolio.holdings.findIndex((h) => h.symbol === symbol);
    if (holdingIndex < 0) return;

    const holding = portfolio.holdings[holdingIndex];
    holding.quantity -= quantity;
    holding.totalInvested = holding.averageCost * holding.quantity;

    if (holding.quantity <= 0) {
      portfolio.holdings.splice(holdingIndex, 1);
    }

    await portfolio.save();
  }

  /**
   * Calculate profit/loss for a sell
   */
  private async calculateProfitLoss(
    userId: string,
    symbol: string,
    quantity: number,
    sellPrice: number
  ): Promise<number> {
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) return 0;

    const holding = portfolio.holdings.find((h) => h.symbol === symbol);
    if (!holding) return 0;

    return (sellPrice - holding.averageCost) * quantity;
  }

  /**
   * Calculate commission
   */
  private calculateCommission(total: number): number {
    const commission = total * this.COMMISSION_RATE;
    return Math.max(commission, this.MIN_COMMISSION);
  }
}

export const tradingService = new TradingService();
