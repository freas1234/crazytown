import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBlockedIP extends Document {
  id: string;
  ip: string;
  reason: string;
  blockedAt: Date;
  duration: number; // in milliseconds
  blockedBy: string;
  unblockedAt?: Date;
  unblockedBy?: string;
}

const BlockedIPSchema: Schema = new Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    ip: { type: String, required: true },
    reason: { type: String, required: true },
    blockedAt: { type: Date, default: Date.now },
    duration: { type: Number, required: true, default: 24 * 60 * 60 * 1000 }, // 24 hours
    blockedBy: { type: String, required: true },
    unblockedAt: { type: Date },
    unblockedBy: { type: String }
  },
  {
    timestamps: true,
  }
);

BlockedIPSchema.index({ ip: 1 });
BlockedIPSchema.index({ blockedAt: -1 });

export default mongoose.models.BlockedIP ||
  mongoose.model<IBlockedIP>('BlockedIP', BlockedIPSchema);
