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
}

export interface InterfaceConfig {
  ipAddress?: string;
  subnetMask?: string;
  enabled: boolean;
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
}

export interface SimulationState {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
  packets: PacketFlow[];
  isRunning: boolean;
}
