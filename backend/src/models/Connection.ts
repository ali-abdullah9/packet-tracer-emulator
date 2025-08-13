import mongoose, { Schema, Document } from 'mongoose';
import { NetworkConnection } from '../types';

export interface IConnection extends Omit<NetworkConnection, 'id'>, Document {
  id: string;
}

const ConnectionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceInterface: { type: String, required: true },
  targetInterface: { type: String, required: true },
  status: { type: String, enum: ['connected', 'disconnected'], default: 'connected' }
}, {
  timestamps: true
});

export const Connection = mongoose.model<IConnection>('Connection', ConnectionSchema);
