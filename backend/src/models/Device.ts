import mongoose, { Schema, Document } from 'mongoose';
import { NetworkDevice } from '../types';

export interface IDevice extends Omit<NetworkDevice, 'id'>, Document {
  id: string;
}

const InterfaceSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  ipAddress: { type: String },
  subnetMask: { type: String },
  status: { type: String, enum: ['up', 'down'], default: 'down' },
  connectedTo: { type: String }
});

const InterfaceConfigSchema = new Schema({
  ipAddress: { type: String },
  subnetMask: { type: String },
  enabled: { type: Boolean, default: true },
  vlan: { type: Number },
  mode: { type: String, enum: ['access', 'trunk'] }
});

const VlanConfigSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  ports: [{ type: String }]
});

const ServiceConfigSchema = new Schema({
  type: { type: String, enum: ['web', 'ftp', 'dhcp', 'dns'], required: true },
  enabled: { type: Boolean, default: false },
  config: { type: Schema.Types.Mixed }
});

const RouteEntrySchema = new Schema({
  destination: { type: String, required: true },
  netmask: { type: String, required: true },
  gateway: { type: String, required: true },
  interface: { type: String, required: true }
});

const DeviceConfigSchema = new Schema({
  hostname: { type: String },
  enablePassword: { type: String },
  interfaces: { type: Map, of: InterfaceConfigSchema },
  routingTable: [RouteEntrySchema],
  vlans: [VlanConfigSchema],
  services: [ServiceConfigSchema]
});

const DeviceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['router', 'switch', 'pc', 'server'], required: true },
  name: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  interfaces: [InterfaceSchema],
  status: { type: String, enum: ['online', 'offline', 'error'], default: 'offline' },
  config: DeviceConfigSchema
}, {
  timestamps: true
});

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);
