import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  filledQuantity: number;
  filledPrice?: number;
  status: 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';
  commission: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      match: [/^[A-Z]{1,5}$/, 'Invalid stock symbol'],
    },
    side: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    type: {
      type: String,
      enum: ['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LIMIT'],
      required: true,
      default: 'MARKET',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number',
      },
    },
    price: {
      type: Number,
      min: [0.01, 'Price must be positive'],
    },
    stopPrice: {
      type: Number,
      min: [0.01, 'Stop price must be positive'],
    },
    filledQuantity: {
      type: Number,
      default: 0,
    },
    filledPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING',
    },
    commission: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ symbol: 1, status: 1 });
OrderSchema.index({ status: 1, expiresAt: 1 });

export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema);
