import mongoose, { Document, Schema } from 'mongoose';

export interface IWatchlistDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    symbols: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 50,
        message: 'Watchlist cannot have more than 50 symbols',
      },
    },
  },
  { timestamps: true }
);

WatchlistSchema.index({ userId: 1 });
WatchlistSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Watchlist = mongoose.model<IWatchlistDocument>('Watchlist', WatchlistSchema);
