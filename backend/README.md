# Packet Tracer Network Emulator - Backend API

This is the backend API server for the Web-Based Packet Tracer Network Emulator. It provides RESTful APIs and real-time Socket.io communication for network simulation and device management.

## Features

- **Device Management**: Create, configure, and manage network devices (routers, switches, PCs, servers)
- **Network Topology**: Build and modify network topologies with connections
- **Packet Simulation**: Send packets, perform ping and traceroute operations
- **Real-time Updates**: Socket.io integration for live network state updates
- **Configuration Management**: Advanced device configuration with validation
- **MongoDB Integration**: Persistent storage for network topologies and device configurations

## Technology Stack

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Validation**: Joi
- **Security**: Helmet, CORS
- **Development**: Nodemon, ts-node

## Project Structure

```
src/
├── controllers/     # Route handlers for API endpoints
├── models/         # MongoDB/Mongoose data models
├── routes/         # Express route definitions
├── middleware/     # Custom middleware (validation, error handling)
├── services/       # Business logic and network simulation
├── socket/         # Socket.io event handlers
├── utils/          # Helper functions and utilities
├── types/          # TypeScript type definitions
└── server.ts       # Main server entry point
```

## API Endpoints

### Network Management
- `GET /api/networks` - List all saved network topologies
- `POST /api/networks` - Create new network topology
- `GET /api/networks/:id` - Get specific network
- `PUT /api/networks/:id` - Update network topology
- `DELETE /api/networks/:id` - Delete network

### Device Management
- `GET /api/devices` - List all devices in current network
- `POST /api/devices` - Add new device to network
- `GET /api/devices/:id` - Get device details and configuration
- `PUT /api/devices/:id` - Update device configuration
- `DELETE /api/devices/:id` - Remove device from network
- `POST /api/devices/:id/interfaces` - Add interface to device
- `PUT /api/devices/:id/interfaces/:interfaceId` - Configure interface
- `PATCH /api/devices/:id/status` - Update device status

### Connection Management
- `GET /api/connections` - List all connections
- `POST /api/connections` - Create connection between devices
- `DELETE /api/connections/:id` - Remove connection
- `PATCH /api/connections/:id/status` - Update connection status

### Simulation Control
- `POST /api/simulation/start` - Start network simulation
- `POST /api/simulation/stop` - Stop simulation
- `POST /api/simulation/reset` - Reset simulation state
- `GET /api/simulation/status` - Get current simulation status

### Packet Operations
- `POST /api/packets/send` - Send packet between devices
- `GET /api/packets/history` - Get packet transmission history
- `POST /api/packets/ping` - Execute ping command
- `POST /api/packets/traceroute` - Execute traceroute

## Socket.io Events

### Client → Server Events
- `join-simulation` - Join simulation room
- `device-update` - Real-time device configuration changes
- `send-packet` - Trigger packet transmission
- `simulation-command` - Execute simulation commands
- `ping` - Send ping packet
- `traceroute` - Perform traceroute

### Server → Client Events
- `packet-flow` - Real-time packet movement updates
- `device-status-changed` - Device online/offline status
- `simulation-state-changed` - Simulation start/stop/reset
- `network-topology-updated` - Network structure changes
- `error` - Error notifications

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

4. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

### Production Build

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/packet-tracer` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `JWT_SECRET` | JWT secret key | - |
| `ENABLE_PASSWORD` | Default enable password | `cisco` |

## Device Configuration

### Supported Device Types

- **Router**: IP routing, static routes, interface configuration
- **Switch**: VLAN management, port configuration, spanning tree
- **PC/Server**: Network settings, services (for servers)

### Configuration Features

- IP address and subnet mask validation
- Routing table management
- VLAN configuration
- Service management (web, DNS, DHCP, FTP)
- Interface status control
- Configuration templates

## Network Simulation

The simulation engine provides:

- **Packet Routing**: Calculates paths through network topology
- **Protocol Support**: ICMP, TCP, UDP, ARP, DNS simulation
- **Device Status**: Online/offline/error states
- **Real-time Updates**: Live packet flow visualization
- **Network Validation**: IP conflicts, subnet consistency checks

## API Response Format

All API responses follow a consistent JSON structure:

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "details": {...}
}
```

**List Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

## Testing

### Running Tests
```bash
npm test
```

### Testing with Postman
Import the provided Postman collection from `docs/api-collection.json` to test all endpoints.

## Development

### Code Structure
- Follow TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper error handling
- Validate all inputs using Joi schemas

### Adding New Features
1. Define types in `src/types/`
2. Create models in `src/models/`
3. Implement business logic in `src/services/`
4. Add controllers in `src/controllers/`
5. Define routes in `src/routes/`
6. Add validation schemas in `src/middleware/validation.ts`

## Contributing

1. Follow the existing code style and structure
2. Add proper TypeScript types for all new features
3. Include error handling and validation
4. Update this README for any new endpoints or features
5. Test thoroughly before submitting

## License

This project is part of a Computer Networks course assignment.
