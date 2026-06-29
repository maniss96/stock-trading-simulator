import { Router } from 'express';
import { tradingController } from '../controllers/tradingController';
import { authenticate } from '../middleware/auth';
import { tradingLimiter } from '../middleware/security';
import { orderValidation, paginationValidation, handleValidation } from '../middleware/validation';

const router = Router();

// All trading routes require authentication
router.use(authenticate);

// POST /api/trading/orders
router.post(
  '/orders',
  tradingLimiter,
  orderValidation,
  handleValidation,
  tradingController.placeOrder
);

// DELETE /api/trading/orders/:orderId
router.delete('/orders/:orderId', tradingController.cancelOrder);

// GET /api/trading/orders?status=&page=&limit=
router.get('/orders', paginationValidation, handleValidation, tradingController.getOrders);

export default router;
