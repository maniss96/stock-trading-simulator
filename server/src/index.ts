import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';

import { config } from './config/environment';
import connectDB from './config/database';
import { logger, morganStream } from './utils/logger';
import routes from './routes';
import { stockService } from './services/stockService';
import { predictionEngine } from './ai/predictionEngine';

// Security middleware
import {
  securityHeaders,
  corsConfig,
  generalLimiter,
  hppProtection,
  requestSizeLimiter,
  xssProtection,
  noSqlInjectionProtection,
  requestId,
} from './middleware/security';
import { notFound, errorHandler } from './middleware/errorHandler';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time updates
const io = new SocketIO(httpServer, {
  cors: {
    origin: config.CORS_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// =====================================================
// MIDDLEWARE STACK (Order matters for security!)
// =====================================================

// 1. Request ID for tracing
app.use(requestId);

// 2. Security headers (Helmet)
app.use(securityHeaders);

// 3. CORS
app.use(corsConfig);

// 4. Rate limiting
app.use(generalLimiter);

// 5. Request size limiting
app.use(requestSizeLimiter);

// 6. Body parsing (before XSS/NoSQL protection)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// 7. HPP (HTTP Parameter Pollution)
app.use(hppProtection);

// 8. Compression
app.use(compression());

// 9. XSS Protection
app.use(xssProtection);

// 10. NoSQL Injection Protection
app.use(noSqlInjectionProtection);

// 11. Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: morganStream }));
}

// 12. Disable fingerprinting
app.disable('x-powered-by');

// =====================================================
// ROUTES
// =====================================================
app.use('/api', routes);

// =====================================================
// ERROR HANDLING
// =====================================================
app.use(notFound);
app.use(errorHandler);

// =====================================================
// SOCKET.IO EVENTS
// =====================================================
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('subscribe:stock', (symbol: string) => {
    socket.join(`stock:${symbol}`);
  });

  socket.on('unsubscribe:stock', (symbol: string) => {
    socket.leave(`stock:${symbol}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// =====================================================
// SERVER STARTUP
// =====================================================
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize stock data
    await stockService.initializeStocks();

    // Generate initial predictions
    await predictionEngine.generateAllPredictions();

    // Start HTTP server
    httpServer.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
      logger.info(`API: http://localhost:${config.PORT}/api`);
      logger.info(`Health: http://localhost:${config.PORT}/api/health`);
    });

    // Simulate price updates every 10 seconds (development)
    if (config.NODE_ENV === 'development') {
      setInterval(async () => {
        await stockService.simulatePriceUpdates();
        const stocks = await stockService.getAllStocks();
        stocks.forEach((stock: any) => {
          io.to(`stock:${stock.symbol}`).emit('price:update', {
            symbol: stock.symbol,
            price: stock.currentPrice,
            change: stock.change,
            changePercent: stock.changePercent,
          });
        });
      }, 10000);
    }

    // Regenerate predictions every hour
    setInterval(async () => {
      await predictionEngine.generateAllPredictions();
      logger.info('Predictions regenerated');
    }, 3600000);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  // Graceful shutdown
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  httpServer.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();

export { app, httpServer, io };
