import { Router } from 'express';
import { stockController } from '../controllers/stockController';
import { symbolValidation, paginationValidation, predictionValidation, handleValidation } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/stocks
router.get('/', stockController.getAllStocks);

// GET /api/stocks/search?q=
router.get('/search', stockController.searchStocks);

// GET /api/stocks/predictions?timeframe=1D
router.get('/predictions', authenticate, predictionValidation, handleValidation, stockController.getAllPredictions);

// GET /api/stocks/:symbol
router.get('/:symbol', symbolValidation, handleValidation, stockController.getStock);

// GET /api/stocks/:symbol/history?days=90
router.get('/:symbol/history', symbolValidation, handleValidation, stockController.getHistoricalData);

// GET /api/stocks/:symbol/prediction?timeframe=1D
router.get('/:symbol/prediction', authenticate, symbolValidation, predictionValidation, handleValidation, stockController.getPrediction);

export default router;
