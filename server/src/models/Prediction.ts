import mongoose, { Document, Schema } from 'mongoose';

export interface IPredictionDocument extends Document {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M';
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  predictedPrice: number;
  currentPrice: number;
  confidence: number;
  indicators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    movingAverages: {
      sma20: number;
      sma50: number;
      sma200: number;
      ema12: number;
      ema26: number;
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    };
    volume: {
      current: number;
      average: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  };
  modelVersion: string;
  accuracy?: number;
  createdAt: Date;
  expiresAt: Date;
}

const PredictionSchema = new Schema<IPredictionDocument>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    timeframe: {
      type: String,
      enum: ['1D', '1W', '1M', '3M'],
      required: true,
    },
    signal: {
      type: String,
      enum: ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'],
      required: true,
    },
    predictedPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    indicators: {
      rsi: Number,
      macd: {
        value: Number,
        signal: Number,
        histogram: Number,
      },
      movingAverages: {
        sma20: Number,
        sma50: Number,
        sma200: Number,
        ema12: Number,
        ema26: Number,
      },
      bollingerBands: {
        upper: Number,
        middle: Number,
        lower: Number,
      },
      volume: {
        current: Number,
        average: Number,
        trend: {
          type: String,
          enum: ['increasing', 'decreasing', 'stable'],
        },
      },
    },
    modelVersion: {
      type: String,
      default: '1.0.0',
    },
    accuracy: Number,
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

PredictionSchema.index({ symbol: 1, timeframe: 1, createdAt: -1 });
PredictionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PredictionSchema.index({ symbol: 1, signal: 1 });

export const Prediction = mongoose.model<IPredictionDocument>('Prediction', PredictionSchema);
