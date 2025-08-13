import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
config();

// Simple demo server without full MongoDB setup for quick testing
class DemoServer {
  private app: express.Application;
  private httpServer: any;
  private io: SocketServer;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
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
        message: 'Packet Tracer Backend API is running!'
      });
    });

    // Mock API endpoints to demonstrate structure
    this.app.get('/api/devices', (req, res) => {
      const mockDevices = [
        {
          id: 'router-1',
          type: 'router',
          name: 'Router-1',
          position: { x: 100, y: 100 },
          status: 'online',
          interfaces: [
            { id: 'gig0/0', name: 'GigabitEthernet0/0', ipAddress: '192.168.1.1', subnetMask: '255.255.255.0', status: 'up' }
          ]
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
          ]
        },
        {
          id: 'pc-1',
          type: 'pc',
          name: 'PC-1',
          position: { x: 500, y: 100 },
          status: 'online',
          interfaces: [
            { id: 'eth0', name: 'Ethernet0', ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', status: 'up' }
          ]
        }
      ];

      res.json({
        success: true,
        data: mockDevices,
        message: 'Devices retrieved successfully'
      });
    });

    this.app.get('/api/simulation/status', (req, res) => {
      res.json({
        success: true,
        data: {
          isRunning: true,
          deviceCount: 3,
          connectionCount: 2,
          activePackets: 0
        }
      });
    });

    this.app.post('/api/packets/ping', (req, res) => {
      const { source, destination } = req.body;
      const packet = {
        id: `ping_${Date.now()}`,
        source,
        destination,
        protocol: 'ICMP',
        status: 'transmitted',
        path: [source, destination],
        timestamp: Date.now()
      };

      // Emit packet flow to connected clients
      this.io.emit('packet-flow', packet);

      res.json({
        success: true,
        data: packet,
        message: 'Ping packet sent successfully'
      });
    });

    // Mock device creation
    this.app.post('/api/devices', (req, res) => {
      const deviceData = req.body;
      const newDevice = {
        ...deviceData,
        id: `device_${Date.now()}`,
        status: 'offline'
      };

      // Emit topology update
      this.io.emit('network-topology-updated', { type: 'device-added', device: newDevice });

      res.status(201).json({
        success: true,
        data: newDevice,
        message: 'Device created successfully'
      });
    });
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-simulation', (data) => {
        const room = data?.room || 'default-simulation';
        socket.join(room);
        socket.emit('joined-simulation', { room });
        console.log(`Client ${socket.id} joined room: ${room}`);
      });

      socket.on('send-packet', (data) => {
        const packet = {
          id: `packet_${Date.now()}`,
          ...data,
          status: 'transmitted',
          path: [data.source, data.destination],
          timestamp: Date.now()
        };

        this.io.emit('packet-flow', packet);
      });

      socket.on('simulation-command', (data) => {
        const { command } = data;
        this.io.emit('simulation-state-changed', { 
          command, 
          isRunning: command === 'start',
          timestamp: Date.now()
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  public start(): void {
    const port = process.env.PORT || 5000;
    this.httpServer.listen(port, () => {
      console.log(`🚀 Demo Packet Tracer Backend running on port ${port}`);
      console.log(`📡 Socket.io server ready for connections`);
      console.log(`🌐 API Health check: http://localhost:${port}/health`);
      console.log(`📋 Mock devices endpoint: http://localhost:${port}/api/devices`);
      console.log(`\n📖 Available API endpoints:`);
      console.log(`   GET  /health - Server health check`);
      console.log(`   GET  /api/devices - List mock devices`);
      console.log(`   POST /api/devices - Create new device`);
      console.log(`   GET  /api/simulation/status - Simulation status`);
      console.log(`   POST /api/packets/ping - Send ping packet`);
      console.log(`\n🔌 Socket.io events:`);
      console.log(`   join-simulation - Join simulation room`);
      console.log(`   send-packet - Send packet through network`);
      console.log(`   simulation-command - Control simulation`);
    });
  }
}

// Check if MongoDB is available (optional for demo)
async function checkMongoDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/packet-tracer';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.log('⚠️  MongoDB not available - running in demo mode without persistence');
  }
}

// Start the demo server
async function startDemo() {
  console.log('🔧 Packet Tracer Network Emulator - Backend Demo');
  console.log('================================================\n');
  
  await checkMongoDB();
  
  const server = new DemoServer();
  server.start();
}

startDemo().catch(error => {
  console.error('Failed to start demo server:', error);
  process.exit(1);
});
