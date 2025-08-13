import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
config();

// Enhanced demo server with in-memory persistence for session
class EnhancedDemoServer {
  private app: express.Application;
  private httpServer: any;
  private io: SocketServer;
  private devices: any[] = []; // In-memory device storage
  private connections: any[] = []; // In-memory connection storage
  private packets: any[] = []; // In-memory packet storage

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
      }
    });

    this.initializeDefaultDevices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  private initializeDefaultDevices(): void {
    // Pre-populate with some default devices
    this.devices = [
      {
        id: 'router-1',
        type: 'router',
        name: 'Router-1',
        position: { x: 100, y: 100 },
        status: 'online',
        interfaces: [
          { id: 'gig0/0', name: 'GigabitEthernet0/0', ipAddress: '192.168.1.1', subnetMask: '255.255.255.0', status: 'up' }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'switch-1',
        type: 'switch',
        name: 'Switch-1',
        position: { x: 300, y: 100 },
        status: 'online',
        interfaces: [
          { id: 'fa0/1', name: 'FastEthernet0/1', status: 'up' },
          { id: 'fa0/2', name: 'FastEthernet0/2', status: 'up' }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'pc-1',
        type: 'pc',
        name: 'PC-1',
        position: { x: 500, y: 100 },
        status: 'online',
        interfaces: [
          { id: 'eth0', name: 'Ethernet0', ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', status: 'up' }
        ],
        createdAt: new Date().toISOString()
      }
    ];
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Enhanced Packet Tracer Backend Demo is running!',
        mode: 'in-memory-persistence'
      });
    });

    // Get all devices - now returns the actual in-memory devices
    this.app.get('/api/devices', (req, res) => {
      res.json({
        success: true,
        data: this.devices,
        message: `${this.devices.length} devices retrieved successfully`
      });
    });

    // Get single device
    this.app.get('/api/devices/:id', (req, res): void => {
      const device = this.devices.find(d => d.id === req.params.id);
      if (!device) {
        res.status(404).json({
          success: false,
          error: 'Device not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: device
      });
    });

    // Create device - now actually adds to the in-memory array
    this.app.post('/api/devices', (req, res) => {
      const deviceData = req.body;
      const newDevice = {
        ...deviceData,
        id: `device_${Date.now()}`,
        status: deviceData.status || 'offline',
        interfaces: deviceData.interfaces || [],
        createdAt: new Date().toISOString()
      };

      // Add to in-memory storage
      this.devices.push(newDevice);

      // Emit topology update
      this.io.emit('network-topology-updated', { 
        type: 'device-added', 
        device: newDevice,
        totalDevices: this.devices.length
      });

      res.status(201).json({
        success: true,
        data: newDevice,
        message: 'Device created and stored in memory successfully'
      });
    });

    // Update device
    this.app.put('/api/devices/:id', (req, res): void => {
      const deviceIndex = this.devices.findIndex(d => d.id === req.params.id);
      if (deviceIndex === -1) {
        res.status(404).json({
          success: false,
          error: 'Device not found'
        });
        return;
      }

      this.devices[deviceIndex] = {
        ...this.devices[deviceIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      this.io.emit('network-topology-updated', { 
        type: 'device-updated', 
        device: this.devices[deviceIndex] 
      });

      res.json({
        success: true,
        data: this.devices[deviceIndex],
        message: 'Device updated successfully'
      });
    });

    // Delete device
    this.app.delete('/api/devices/:id', (req, res): void => {
      const deviceIndex = this.devices.findIndex(d => d.id === req.params.id);
      if (deviceIndex === -1) {
        res.status(404).json({
          success: false,
          error: 'Device not found'
        });
        return;
      }

      const deletedDevice = this.devices.splice(deviceIndex, 1)[0];

      this.io.emit('network-topology-updated', { 
        type: 'device-removed', 
        device: deletedDevice,
        totalDevices: this.devices.length 
      });

      res.json({
        success: true,
        message: 'Device deleted successfully'
      });
    });

    // Simulation status - now reflects actual device count
    this.app.get('/api/simulation/status', (req, res) => {
      res.json({
        success: true,
        data: {
          isRunning: true,
          deviceCount: this.devices.length,
          connectionCount: this.connections.length,
          activePackets: this.packets.length,
          mode: 'in-memory-demo'
        }
      });
    });

    // Ping endpoint
    this.app.post('/api/packets/ping', (req, res) => {
      const { source, destination } = req.body;
      const packet = {
        id: `ping_${Date.now()}`,
        source,
        destination,
        protocol: 'ICMP',
        status: 'transmitted',
        path: [source, destination],
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
      };

      // Store packet in memory
      this.packets.push(packet);

      // Emit packet flow to connected clients
      this.io.emit('packet-flow', packet);

      res.json({
        success: true,
        data: packet,
        message: 'Ping packet sent successfully'
      });
    });

    // Get all packets
    this.app.get('/api/packets', (req, res) => {
      res.json({
        success: true,
        data: this.packets,
        message: `${this.packets.length} packets retrieved`
      });
    });

    // Clear all data (useful for testing)
    this.app.post('/api/demo/reset', (req, res) => {
      this.devices = [];
      this.connections = [];
      this.packets = [];
      this.initializeDefaultDevices();
      
      this.io.emit('network-topology-updated', { 
        type: 'reset', 
        totalDevices: this.devices.length 
      });

      res.json({
        success: true,
        message: 'Demo data reset to defaults'
      });
    });
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-simulation', (data) => {
        const room = data?.room || 'default-simulation';
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
        socket.emit('joined-simulation', { room, status: 'success' });
      });

      socket.on('send-packet', (data) => {
        const packet = {
          ...data,
          id: `socket_${Date.now()}`,
          timestamp: Date.now(),
          createdAt: new Date().toISOString()
        };
        
        this.packets.push(packet);
        this.io.emit('packet-flow', packet);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  public start(): void {
    const PORT = process.env.PORT || 5000;
    
    this.httpServer.listen(PORT, () => {
      console.log('🔧 Enhanced Packet Tracer Network Emulator - Demo with Persistence');
      console.log('================================================================');
      console.log(`🚀 Enhanced Demo Server running on port ${PORT}`);
      console.log('📡 Socket.io server ready for connections');
      console.log(`🌐 API Health check: http://localhost:${PORT}/health`);
      console.log(`📋 Devices endpoint: http://localhost:${PORT}/api/devices`);
      console.log(`🔄 Reset demo data: POST http://localhost:${PORT}/api/demo/reset`);
      console.log('💾 In-memory persistence enabled - devices persist during session!');
      console.log(`📊 Initial devices loaded: ${this.devices.length}`);
      console.log('================================================================');
    });
  }
}

// Start the enhanced demo server
const server = new EnhancedDemoServer();
server.start();
