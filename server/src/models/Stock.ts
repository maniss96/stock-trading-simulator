import mongoose, { Document, Schema } from 'mongoose';

export interface IStockDocument extends Document {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  peRatio?: number;
  dividendYield?: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

const StockSchema = new Schema<IStockDocument>(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{1,5}$/, 'Invalid stock symbol'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    exchange: {
      type: String,
      default: 'NASDAQ',
    },
    sector: {
      type: String,
      default: 'Technology',
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    previousClose: {
      type: Number,
      min: 0,
    },
    open: {
      type: Number,
      min: 0,
    },
    high: {
      type: Number,
      min: 0,
    },
    low: {
      type: Number,
      min: 0,
    },
    volume: {
      type: Number,
      default: 0,
    },
    marketCap: {
      type: Number,
      default: 0,
    },
    peRatio: Number,
    dividendYield: Number,
    change: {
      type: Number,
      default: 0,
    },
    changePercent: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

StockSchema.index({ symbol: 1 });
StockSchema.index({ sector: 1 });
StockSchema.index({ lastUpdated: -1 });

export const Stock = mongoose.model<IStockDocument>('Stock', StockSchema);

// =====================================================
// STOCK HISTORICAL DATA
// =====================================================

export interface IStockHistoricalDocument extends Document {
  symbol: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

const StockHistoricalSchema = new Schema<IStockHistoricalDocument>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    date: {
      type: Date,
      required: true,
    },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true },
    adjustedClose: { type: Number, required: true },
  },
  { timestamps: true }
);

StockHistoricalSchema.index({ symbol: 1, date: -1 });
StockHistoricalSchema.index({ symbol: 1, date: 1 }, { unique: true });

export const StockHistorical = mongoose.model<IStockHistoricalDocument>(
  'StockHistorical',
  StockHistoricalSchema
);
