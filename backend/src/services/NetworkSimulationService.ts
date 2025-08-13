import { EventEmitter } from 'events';
import { NetworkDevice, NetworkConnection, PacketFlow, SimulationState } from '../types';
import { Device, Connection, Packet } from '../models';

export class NetworkSimulationService extends EventEmitter {
  private simulationState: SimulationState = {
    devices: [],
    connections: [],
    packets: [],
    isRunning: false
  };

  constructor() {
    super();
    this.loadSimulationState();
  }

  async loadSimulationState(): Promise<void> {
    try {
      const devices = await Device.find({}).lean();
      const connections = await Connection.find({}).lean();
      const packets = await Packet.find({ status: { $in: ['pending', 'transmitted'] } }).lean();

      this.simulationState = {
        devices: devices as NetworkDevice[],
        connections: connections as NetworkConnection[],
        packets: packets as PacketFlow[],
        isRunning: false
      };
    } catch (error) {
      console.error('Error loading simulation state:', error);
    }
  }

  getSimulationState(): SimulationState {
    return { ...this.simulationState };
  }

  startSimulation(): void {
    this.simulationState.isRunning = true;
    this.emit('simulation-state-changed', { isRunning: true });
  }

  stopSimulation(): void {
    this.simulationState.isRunning = false;
    this.emit('simulation-state-changed', { isRunning: false });
  }

  resetSimulation(): void {
    this.simulationState.packets = [];
    this.simulationState.isRunning = false;
    
    // Reset all devices to offline status
    this.simulationState.devices.forEach(device => {
      device.status = 'offline';
    });

    this.emit('simulation-state-changed', { isRunning: false });
    this.emit('network-topology-updated', this.simulationState);
  }

  async addDevice(device: NetworkDevice): Promise<void> {
    this.simulationState.devices.push(device);
    this.emit('network-topology-updated', this.simulationState);
  }

  async removeDevice(deviceId: string): Promise<void> {
    this.simulationState.devices = this.simulationState.devices.filter(d => d.id !== deviceId);
    this.simulationState.connections = this.simulationState.connections.filter(
      c => c.source !== deviceId && c.target !== deviceId
    );
    this.emit('network-topology-updated', this.simulationState);
  }

  async updateDeviceStatus(deviceId: string, status: 'online' | 'offline' | 'error'): Promise<void> {
    const device = this.simulationState.devices.find(d => d.id === deviceId);
    if (device) {
      device.status = status;
      await Device.findOneAndUpdate({ id: deviceId }, { status });
      this.emit('device-status-changed', { deviceId, status });
    }
  }

  async addConnection(connection: NetworkConnection): Promise<void> {
    this.simulationState.connections.push(connection);
    this.emit('network-topology-updated', this.simulationState);
  }

  async removeConnection(connectionId: string): Promise<void> {
    this.simulationState.connections = this.simulationState.connections.filter(c => c.id !== connectionId);
    this.emit('network-topology-updated', this.simulationState);
  }

  async sendPacket(packetData: Omit<PacketFlow, 'id' | 'status' | 'path' | 'timestamp'>): Promise<PacketFlow> {
    const packet: PacketFlow = {
      ...packetData,
      id: this.generatePacketId(),
      status: 'pending',
      path: [],
      timestamp: Date.now()
    };

    // Calculate packet path
    const path = this.calculatePacketPath(packet.source, packet.destination);
    packet.path = path;

    if (path.length === 0) {
      packet.status = 'dropped';
    } else {
      packet.status = 'transmitted';
    }

    this.simulationState.packets.push(packet);

    // Save to database
    await new Packet(packet).save();

    // Emit packet flow event
    this.emit('packet-flow', packet);

    // Simulate packet transmission
    if (packet.status === 'transmitted') {
      this.simulatePacketTransmission(packet);
    }

    return packet;
  }

  private calculatePacketPath(source: string, destination: string): string[] {
    const sourceDevice = this.simulationState.devices.find(d => d.id === source);
    const destDevice = this.simulationState.devices.find(d => d.id === destination);

    if (!sourceDevice || !destDevice) {
      return [];
    }

    // Simple path calculation - direct connection check
    const directConnection = this.simulationState.connections.find(
      c => (c.source === source && c.target === destination) ||
           (c.source === destination && c.target === source)
    );

    if (directConnection) {
      return [source, destination];
    }

    // Basic routing through connected devices
    const visited = new Set<string>();
    const path = this.findPath(source, destination, visited);
    
    return path || [];
  }

  private findPath(current: string, destination: string, visited: Set<string>): string[] | null {
    if (current === destination) {
      return [current];
    }

    visited.add(current);

    const connections = this.simulationState.connections.filter(
      c => (c.source === current || c.target === current) && c.status === 'connected'
    );

    for (const connection of connections) {
      const next = connection.source === current ? connection.target : connection.source;
      
      if (!visited.has(next)) {
        const path = this.findPath(next, destination, visited);
        if (path) {
          return [current, ...path];
        }
      }
    }

    return null;
  }

  private async simulatePacketTransmission(packet: PacketFlow): Promise<void> {
    // Simulate delay for packet transmission
    setTimeout(async () => {
      packet.status = 'received';
      await Packet.findOneAndUpdate({ id: packet.id }, { status: 'received' });
      this.emit('packet-flow', packet);
    }, 1000); // 1 second delay
  }

  private generatePacketId(): string {
    return `packet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async ping(source: string, destination: string): Promise<PacketFlow> {
    return this.sendPacket({
      source,
      destination,
      protocol: 'ICMP',
      payload: { type: 'ping', sequence: 1 }
    });
  }

  async traceroute(source: string, destination: string): Promise<PacketFlow[]> {
    const path = this.calculatePacketPath(source, destination);
    const packets: PacketFlow[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const packet = await this.sendPacket({
        source,
        destination: path[i + 1],
        protocol: 'ICMP',
        payload: { type: 'traceroute', hop: i + 1 }
      });
      packets.push(packet);
    }

    return packets;
  }

  getPacketHistory(): PacketFlow[] {
    return [...this.simulationState.packets];
  }
}
