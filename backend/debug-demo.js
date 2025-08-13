import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(cors());
app.use(express.json());

// Error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error);
    return res.status(400).json({ success: false, error: 'Invalid JSON' });
  }
  next();
});

// Health check with detailed logging
app.get('/health', (req, res) => {
  console.log('Health check requested');
  const healthData = { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Packet Tracer Backend API is running!'
  };
  console.log('Sending health response:', healthData);
  res.json(healthData);
});

// Get all devices with detailed logging
app.get('/api/devices', (req, res) => {
  console.log('Get devices requested');
  try {
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

    const response = {
      success: true,
      data: mockDevices,
      message: 'Devices retrieved successfully'
    };
    
    console.log('Sending devices response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error in get devices:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create device with detailed logging
app.post('/api/devices', (req, res) => {
  console.log('Create device requested');
  console.log('Request body:', req.body);
  
  try {
    const deviceData = req.body;
    const newDevice = {
      ...deviceData,
      id: `device_${Date.now()}`,
      status: 'offline'
    };

    console.log('Created device:', newDevice);
    
    // Emit topology update
    io.emit('network-topology-updated', { type: 'device-added', device: newDevice });

    const response = {
      success: true,
      data: newDevice,
      message: 'Device created successfully'
    };
    
    console.log('Sending create device response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error in create device:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Simulation status with detailed logging
app.get('/api/simulation/status', (req, res) => {
  console.log('Simulation status requested');
  try {
    const response = {
      success: true,
      data: {
        isRunning: true,
        deviceCount: 3,
        connectionCount: 2,
        activePackets: 0
      }
    };
    
    console.log('Sending simulation status response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in simulation status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Ping endpoint
app.post('/api/packets/ping', (req, res) => {
  console.log('Ping requested');
  console.log('Request body:', req.body);
  
  try {
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

    console.log('Created ping packet:', packet);
    
    // Emit packet flow to connected clients
    io.emit('packet-flow', packet);

    const response = {
      success: true,
      data: packet,
      message: 'Ping packet sent successfully'
    };
    
    console.log('Sending ping response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in ping:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-simulation', (data) => {
    const room = data?.room || 'default-simulation';
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
    socket.emit('joined-simulation', { room, status: 'success' });
  });

  socket.on('send-packet', (data) => {
    console.log('Packet sent via socket:', data);
    io.emit('packet-flow', { ...data, timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log('🔧 Packet Tracer Network Emulator - Debug Demo');
  console.log('================================================');
  console.log(`🚀 Debug Demo Server running on port ${PORT}`);
  console.log('📡 Socket.io server ready for connections');
  console.log(`🌐 API Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Devices endpoint: http://localhost:${PORT}/api/devices`);
  console.log('📝 Enhanced logging enabled for debugging');
  console.log('================================================');
});
