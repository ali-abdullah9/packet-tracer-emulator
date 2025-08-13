# Packet Tracer Backend API Documentation

## Quick Start Demo

To run the backend demo without MongoDB setup:

```bash
cd backend
npm install
npm run demo
```

The demo server will start on `http://localhost:5000` with mock data.

## API Endpoints Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
Currently no authentication required (add JWT later if needed).

### Response Format
All responses follow this structure:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string (if success is false)
}
```

---

## Device Management

### GET /api/devices
Get all network devices.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "router-1",
      "type": "router",
      "name": "Router-1",
      "position": { "x": 100, "y": 100 },
      "status": "online",
      "interfaces": [
        {
          "id": "gig0/0",
          "name": "GigabitEthernet0/0",
          "ipAddress": "192.168.1.1",
          "subnetMask": "255.255.255.0",
          "status": "up"
        }
      ]
    }
  ]
}
```

### POST /api/devices
Create a new network device.

**Request Body:**
```json
{
  "type": "router|switch|pc|server",
  "name": "Device Name",
  "position": { "x": 100, "y": 100 },
  "interfaces": []
}
```

### GET /api/devices/:id
Get specific device details.

### PUT /api/devices/:id
Update device configuration.

### DELETE /api/devices/:id
Remove device from network.

### PATCH /api/devices/:id/status
Update device online/offline status.

**Request Body:**
```json
{
  "status": "online|offline|error"
}
```

---

## Connection Management

### GET /api/connections
Get all network connections.

### POST /api/connections
Create connection between devices.

**Request Body:**
```json
{
  "source": "device-id-1",
  "target": "device-id-2",
  "sourceInterface": "gig0/0",
  "targetInterface": "fa0/1"
}
```

### DELETE /api/connections/:id
Remove network connection.

---

## Network Topology

### GET /api/networks
Get all saved network topologies.

### POST /api/networks
Save current network topology.

**Request Body:**
```json
{
  "name": "Network Name",
  "description": "Network description",
  "devices": ["device-id-1", "device-id-2"],
  "connections": ["connection-id-1"]
}
```

---

## Simulation Control

### GET /api/simulation/status
Get current simulation status.

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "deviceCount": 3,
    "connectionCount": 2,
    "activePackets": 1
  }
}
```

### POST /api/simulation/start
Start network simulation.

### POST /api/simulation/stop
Stop network simulation.

### POST /api/simulation/reset
Reset simulation state.

---

## Packet Operations

### POST /api/packets/send
Send a packet through the network.

**Request Body:**
```json
{
  "source": "device-id-1",
  "destination": "device-id-2",
  "protocol": "ICMP|TCP|UDP|ARP|DNS",
  "payload": {}
}
```

### POST /api/packets/ping
Send ICMP ping packet.

**Request Body:**
```json
{
  "source": "pc-1",
  "destination": "192.168.1.1"
}
```

### POST /api/packets/traceroute
Perform network traceroute.

### GET /api/packets/history
Get packet transmission history.

---

## Socket.io Events

### Client Events (Client → Server)

#### join-simulation
Join a simulation room for real-time updates.
```javascript
socket.emit('join-simulation', { room: 'simulation-1' });
```

#### send-packet
Send packet through network in real-time.
```javascript
socket.emit('send-packet', {
  source: 'pc-1',
  destination: 'server-1',
  protocol: 'TCP',
  payload: { data: 'Hello World' }
});
```

#### simulation-command
Control simulation state.
```javascript
socket.emit('simulation-command', { command: 'start' });
```

### Server Events (Server → Client)

#### packet-flow
Real-time packet movement updates.
```javascript
socket.on('packet-flow', (packet) => {
  console.log('Packet moving:', packet);
});
```

#### device-status-changed
Device online/offline status changes.
```javascript
socket.on('device-status-changed', (data) => {
  console.log('Device status:', data);
});
```

#### network-topology-updated
Network structure changes.
```javascript
socket.on('network-topology-updated', (topology) => {
  console.log('Topology updated:', topology);
});
```

#### simulation-state-changed
Simulation start/stop/reset events.
```javascript
socket.on('simulation-state-changed', (state) => {
  console.log('Simulation state:', state);
});
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error description",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `404` - Not Found (device/connection not found)
- `500` - Internal Server Error

---

## Examples

### Creating a Simple Network

1. **Create Router:**
```bash
curl -X POST http://localhost:5000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "type": "router",
    "name": "Main-Router",
    "position": { "x": 100, "y": 100 }
  }'
```

2. **Create Switch:**
```bash
curl -X POST http://localhost:5000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "type": "switch",
    "name": "Main-Switch",
    "position": { "x": 300, "y": 100 }
  }'
```

3. **Connect Devices:**
```bash
curl -X POST http://localhost:5000/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "source": "router-id",
    "target": "switch-id",
    "sourceInterface": "gig0/0",
    "targetInterface": "fa0/1"
  }'
```

4. **Send Ping:**
```bash
curl -X POST http://localhost:5000/api/packets/ping \
  -H "Content-Type: application/json" \
  -d '{
    "source": "router-id",
    "destination": "192.168.1.10"
  }'
```

### Frontend Integration Example

```javascript
// Connect to Socket.io
const socket = io('http://localhost:5000');

// Join simulation room
socket.emit('join-simulation', { room: 'main-simulation' });

// Listen for packet flow
socket.on('packet-flow', (packet) => {
  // Update packet visualization
  updatePacketVisualization(packet);
});

// Send API request
async function createDevice(deviceData) {
  const response = await fetch('http://localhost:5000/api/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deviceData)
  });
  return response.json();
}
```

---

## Testing the API

### Using curl
```bash
# Test health endpoint
curl http://localhost:5000/health

# Get devices
curl http://localhost:5000/api/devices

# Get simulation status
curl http://localhost:5000/api/simulation/status
```

### Using Postman
Import the API collection (create `postman-collection.json` for this).

### Using JavaScript/Fetch
```javascript
// Test API endpoint
fetch('http://localhost:5000/api/devices')
  .then(response => response.json())
  .then(data => console.log(data));
```
