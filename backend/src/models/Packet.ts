import mongoose, { Schema, Document } from 'mongoose';
import { PacketFlow } from '../types';

export interface IPacket extends PacketFlow, Document {}

const PacketSchema = new Schema({
  id: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  protocol: { type: String, enum: ['ICMP', 'TCP', 'UDP', 'ARP', 'DNS'], required: true },
  status: { type: String, enum: ['pending', 'transmitted', 'received', 'dropped'], default: 'pending' },
  path: [{ type: String }],
  timestamp: { type: Number, required: true },
  payload: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export const Packet = mongoose.model<IPacket>('Packet', PacketSchema);
