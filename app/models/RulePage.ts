import mongoose, { Schema, Document } from 'mongoose';

interface IContent {
  en: string;
  ar: string;
}

export interface IRulePage extends Document {
  title: IContent;
  content: IContent;
  category: 'admin' | 'ems' | 'police' | 'general' | 'safe-zones';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema({
  en: { type: String, required: true },
  ar: { type: String, required: true }
});

const RulePageSchema = new Schema<IRulePage>(
  {
    title: { 
      type: ContentSchema, 
      required: true 
    },
    content: { 
      type: ContentSchema, 
      required: true 
    },
    category: { 
      type: String, 
      enum: ['admin', 'ems', 'police', 'general', 'safe-zones'],
      required: true 
    },
    order: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    timestamps: true 
  }
);

// Don't recreate the model if it already exists
export default mongoose.models.RulePage || mongoose.model<IRulePage>('RulePage', RulePageSchema); 