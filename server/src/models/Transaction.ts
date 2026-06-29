import mongoose, { Document, Schema } from 'mongoose';

export interface ITransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  commission: number;
  profitLoss?: number;
  balanceAfter: number;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    side: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
      min: 0,
    },
    profitLoss: {
      type: Number,
      default: null,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, symbol: 1 });
TransactionSchema.index({ symbol: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransactionDocument>(
  'Transaction',
  TransactionSchema
);
