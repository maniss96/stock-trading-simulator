import mongoose, { Document, Schema } from 'mongoose';

export interface IHolding {
  symbol: string;
  quantity: number;
  averageCost: number;
  totalInvested: number;
}

export interface IPortfolioDocument extends Document {
  userId: mongoose.Types.ObjectId;
  holdings: IHolding[];
  createdAt: Date;
  updatedAt: Date;
}

const HoldingSchema = new Schema<IHolding>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    averageCost: {
      type: Number,
      required: true,
      min: 0,
    },
    totalInvested: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const PortfolioSchema = new Schema<IPortfolioDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    holdings: {
      type: [HoldingSchema],
      default: [],
    },
  },
  { timestamps: true }
);

PortfolioSchema.index({ userId: 1 });
PortfolioSchema.index({ 'holdings.symbol': 1 });

export const Portfolio = mongoose.model<IPortfolioDocument>('Portfolio', PortfolioSchema);

// =====================================================
// PORTFOLIO HISTORY (Daily snapshots)
// =====================================================

export interface IPortfolioHistoryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalValue: number;
  cashBalance: number;
  holdingsValue: number;
  dailyReturn: number;
}

const PortfolioHistorySchema = new Schema<IPortfolioHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    cashBalance: {
      type: Number,
      required: true,
    },
    holdingsValue: {
      type: Number,
      required: true,
    },
    dailyReturn: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

PortfolioHistorySchema.index({ userId: 1, date: -1 });
PortfolioHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

export const PortfolioHistory = mongoose.model<IPortfolioHistoryDocument>(
  'PortfolioHistory',
  PortfolioHistorySchema
);
