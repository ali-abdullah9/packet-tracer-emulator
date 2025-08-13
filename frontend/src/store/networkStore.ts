import { create } from 'zustand';
import { NetworkDevice, NetworkConnection, PacketFlow, SimulationState } from '@/types';

interface NetworkStore extends SimulationState {
  // Device actions
  addDevice: (device: Omit<NetworkDevice, 'id'>) => void;
  removeDevice: (deviceId: string) => void;
  updateDevice: (deviceId: string, updates: Partial<NetworkDevice>) => void;
  
  // Connection actions
  addConnection: (connection: Omit<NetworkConnection, 'id'>) => void;
  removeConnection: (connectionId: string) => void;
  
  // Packet actions
  addPacket: (packet: Omit<PacketFlow, 'id'>) => void;
  updatePacket: (packetId: string, updates: Partial<PacketFlow>) => void;
  clearPackets: () => void;
  
  // Simulation actions
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  devices: [],
  connections: [],
  packets: [],
  isRunning: false,

  addDevice: (deviceData) => {
    const device: NetworkDevice = {
      ...deviceData,
      id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    set((state) => ({
      devices: [...state.devices, device],
    }));
  },

  removeDevice: (deviceId) => {
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== deviceId),
      connections: state.connections.filter(
        (c) => c.source !== deviceId && c.target !== deviceId
      ),
    }));
  },

  updateDevice: (deviceId, updates) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId ? { ...d, ...updates } : d
      ),
    }));
  },

  addConnection: (connectionData) => {
    const connection: NetworkConnection = {
      ...connectionData,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    set((state) => ({
      connections: [...state.connections, connection],
    }));
  },

  removeConnection: (connectionId) => {
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== connectionId),
    }));
  },

  addPacket: (packetData) => {
    const packet: PacketFlow = {
      ...packetData,
      id: `packet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    set((state) => ({
      packets: [...state.packets, packet],
    }));
  },

  updatePacket: (packetId, updates) => {
    set((state) => ({
      packets: state.packets.map((p) =>
        p.id === packetId ? { ...p, ...updates } : p
      ),
    }));
  },

  clearPackets: () => {
    set({ packets: [] });
  },

  startSimulation: () => {
    set({ isRunning: true });
  },

  stopSimulation: () => {
    set({ isRunning: false });
  },

  resetSimulation: () => {
    set({
      packets: [],
      isRunning: false,
      devices: get().devices.map((d) => ({ ...d, status: 'offline' })),
    });
  },
}));
