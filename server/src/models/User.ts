import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment';

export interface IUserDocument extends Document {
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  balance: number;
  initialBalance: number;
  totalProfitLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  rank: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
    icon: string;
  }>;
  loginAttempts: number;
  lockUntil?: Date;
  refreshTokens: string[];
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 60,
    },
    avatar: {
      type: String,
      default: null,
    },
    balance: {
      type: Number,
      default: 100000,
      min: [0, 'Balance cannot be negative'],
    },
    initialBalance: {
      type: Number,
      default: 100000,
    },
    totalProfitLoss: {
      type: Number,
      default: 0,
    },
    totalTrades: {
      type: Number,
      default: 0,
    },
    winningTrades: {
      type: Number,
      default: 0,
    },
    losingTrades: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rank: {
      type: Number,
      default: 0,
    },
    achievements: [
      {
        id: String,
        name: String,
        description: String,
        unlockedAt: Date,
        icon: String,
      },
    ],
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ rank: 1 });
UserSchema.index({ totalProfitLoss: -1 });
UserSchema.index({ winRate: -1 });

// Virtual: check if account is locked
UserSchema.virtual('isLocked').get(function (this: IUserDocument) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If lockUntil has expired, reset
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  const updates: Record<string, unknown> = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: new Date(Date.now() + 15 * 60 * 1000) }; // 15 min
  }

  await this.updateOne(updates);
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
