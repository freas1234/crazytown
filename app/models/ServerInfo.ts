import mongoose, { Schema, Document } from 'mongoose';

interface IContent {
  en: string;
  ar: string;
}

export interface IServerInfo extends Document {
  content: IContent;
  updatedAt: Date;
}

const ContentSchema = new Schema({
  en: { type: String, required: true },
  ar: { type: String, required: true }
});

const ServerInfoSchema = new Schema<IServerInfo>(
  {
    content: { 
      type: ContentSchema, 
      required: true 
    }
  },
  { 
    timestamps: true 
  }
);

// Don't recreate the model if it already exists
export default mongoose.models.ServerInfo || mongoose.model<IServerInfo>('ServerInfo', ServerInfoSchema); 