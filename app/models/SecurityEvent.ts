import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISecurityEvent extends Document {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

const SecurityEventSchema: Schema = new Schema(
  {
    id: { type: String, default: uuidv4, unique: true },
    type: { type: String, required: true },
    severity: { 
      type: String, 
      required: true, 
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] 
    },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

SecurityEventSchema.index({ ipAddress: 1, timestamp: -1 });
SecurityEventSchema.index({ type: 1, severity: 1 });
SecurityEventSchema.index({ timestamp: -1 });

export default mongoose.models.SecurityEvent ||
  mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);
