export interface NetworkDevice {
  id: string;
  type: 'router' | 'switch' | 'pc' | 'server';
  name: string;
  position: { x: number; y: number };
  interfaces: NetworkInterface[];
  status: 'online' | 'offline' | 'error';
  config?: DeviceConfig;
}

export interface NetworkInterface {
  id: string;
  name: string;
  ipAddress?: string;
  subnetMask?: string;
  status: 'up' | 'down';
  connectedTo?: string;
}

export interface DeviceConfig {
  hostname?: string;
  enablePassword?: string;
  interfaces?: Record<string, InterfaceConfig>;
  routingTable?: RouteEntry[];
  vlans?: VlanConfig[];
  services?: ServiceConfig[];
}

export interface InterfaceConfig {
  ipAddress?: string;
  subnetMask?: string;
  enabled: boolean;
  vlan?: number;
  mode?: 'access' | 'trunk';
}

export interface VlanConfig {
  id: number;
  name: string;
  ports: string[];
}

export interface ServiceConfig {
  type: 'web' | 'ftp' | 'dhcp' | 'dns';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface RouteEntry {
  destination: string;
  netmask: string;
  gateway: string;
  interface: string;
}

export interface NetworkConnection {
  id: string;
  source: string;
  target: string;
  sourceInterface: string;
  targetInterface: string;
  status: 'connected' | 'disconnected';
}

export interface PacketFlow {
  id: string;
  source: string;
  destination: string;
  protocol: 'ICMP' | 'TCP' | 'UDP' | 'ARP' | 'DNS';
  status: 'pending' | 'transmitted' | 'received' | 'dropped';
  path: string[];
  timestamp: number;
  payload?: any;
}

export interface SimulationState {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
  packets: PacketFlow[];
  isRunning: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: object;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  count: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface NetworkTopology {
  id: string;
  name: string;
  description?: string;
  devices: NetworkDevice[];
  connections: NetworkConnection[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}
