import mongoose, { Schema, Document } from 'mongoose';
import { NetworkTopology } from '../types';

export interface INetwork extends Omit<NetworkTopology, 'devices' | 'connections'>, Document {
  devices: string[];
  connections: string[];
}

const NetworkSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  devices: [{ type: String, ref: 'Device' }],
  connections: [{ type: String, ref: 'Connection' }],
  userId: { type: String }
}, {
  timestamps: true
});

export const Network = mongoose.model<INetwork>('Network', NetworkSchema);
