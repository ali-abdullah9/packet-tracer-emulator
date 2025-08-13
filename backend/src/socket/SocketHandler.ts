import { Server as SocketServer, Socket } from 'socket.io';
import { NetworkSimulationService } from '../services';

export class SocketHandler {
  constructor(
    private io: SocketServer,
    private simulationService: NetworkSimulationService
  ) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // Join simulation room
      socket.on('join-simulation', (data: { room?: string }) => {
        const room = data.room || 'default-simulation';
        socket.join(room);
        socket.emit('joined-simulation', { room });
        console.log(`Client ${socket.id} joined room: ${room}`);
      });

      // Handle device updates
      socket.on('device-update', async (data: { deviceId: string; updates: any }) => {
        try {
          // Update device in simulation service
          // This would involve calling the appropriate service method
          socket.broadcast.emit('device-status-changed', {
            deviceId: data.deviceId,
            updates: data.updates
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to update device' });
        }
      });

      // Handle packet sending
      socket.on('send-packet', async (data: {
        source: string;
        destination: string;
        protocol: string;
        payload?: any;
      }) => {
        try {
          const packet = await this.simulationService.sendPacket(data);
          this.io.emit('packet-flow', packet);
        } catch (error) {
          socket.emit('error', { message: 'Failed to send packet' });
        }
      });

      // Handle simulation commands
      socket.on('simulation-command', (data: { command: string; params?: any }) => {
        try {
          switch (data.command) {
            case 'start':
              this.simulationService.startSimulation();
              break;
            case 'stop':
              this.simulationService.stopSimulation();
              break;
            case 'reset':
              this.simulationService.resetSimulation();
              break;
            default:
              socket.emit('error', { message: 'Unknown simulation command' });
              return;
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to execute simulation command' });
        }
      });

      // Handle ping command
      socket.on('ping', async (data: { source: string; destination: string }) => {
        try {
          const packet = await this.simulationService.ping(data.source, data.destination);
          this.io.emit('packet-flow', packet);
        } catch (error) {
          socket.emit('error', { message: 'Failed to send ping' });
        }
      });

      // Handle traceroute command
      socket.on('traceroute', async (data: { source: string; destination: string }) => {
        try {
          const packets = await this.simulationService.traceroute(data.source, data.destination);
          packets.forEach(packet => {
            this.io.emit('packet-flow', packet);
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to perform traceroute' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Listen to simulation service events and broadcast to clients
    this.simulationService.on('packet-flow', (packet) => {
      this.io.emit('packet-flow', packet);
    });

    this.simulationService.on('device-status-changed', (data) => {
      this.io.emit('device-status-changed', data);
    });

    this.simulationService.on('simulation-state-changed', (state) => {
      this.io.emit('simulation-state-changed', state);
    });

    this.simulationService.on('network-topology-updated', (topology) => {
      this.io.emit('network-topology-updated', topology);
    });
  }

  // Method to send updates to specific rooms
  public emitToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  // Method to broadcast to all connected clients
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }
}
