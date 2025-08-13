import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Import local modules
import { connectDatabase } from './utils/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import { NetworkSimulationService } from './services';
import { 
  DeviceController, 
  ConnectionController, 
  NetworkController, 
  SimulationController, 
  PacketController 
} from './controllers';
import { createApiRoutes } from './routes';
import { SocketHandler } from './socket';

// Load environment variables
config();

class Server {
  private app: express.Application;
  private httpServer: any;
  private io: SocketServer;
  private simulationService: NetworkSimulationService;
  private socketHandler: SocketHandler;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
      }
    });

    this.simulationService = new NetworkSimulationService();
    this.socketHandler = new SocketHandler(this.io, this.simulationService);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }));

    // Logging
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Initialize controllers
    const deviceController = new DeviceController(this.simulationService);
    const connectionController = new ConnectionController(this.simulationService);
    const networkController = new NetworkController();
    const simulationController = new SimulationController(this.simulationService);
    const packetController = new PacketController(this.simulationService);

    // API routes
    this.app.use('/api', createApiRoutes(
      deviceController,
      connectionController,
      networkController,
      simulationController,
      packetController
    ));
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFound);
    
    // Error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/packet-tracer';
      await connectDatabase(mongoUri);

      // Start server
      const port = process.env.PORT || 5000;
      this.httpServer.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Socket.io server ready for connections`);
      });

      // Graceful shutdown handling
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('Received shutdown signal, shutting down gracefully...');
    
    this.httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
}

// Start the server
const server = new Server();
server.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
