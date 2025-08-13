import { Request, Response } from 'express';
import { ApiResponse, PacketFlow } from '../types';
import { NetworkSimulationService } from '../services';

export class PacketController {
  constructor(private simulationService: NetworkSimulationService) {}

  async sendPacket(req: Request, res: Response): Promise<void> {
    try {
      const { source, destination, protocol, payload } = req.body;
      
      const packet = await this.simulationService.sendPacket({
        source,
        destination,
        protocol,
        payload
      });

      const response: ApiResponse<PacketFlow> = {
        success: true,
        data: packet,
        message: 'Packet sent successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to send packet'
      };
      res.status(500).json(response);
    }
  }

  async getPacketHistory(_req: Request, res: Response): Promise<void> {
    try {
      const packets = this.simulationService.getPacketHistory();
      const response: ApiResponse<PacketFlow[]> = {
        success: true,
        data: packets
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch packet history'
      };
      res.status(500).json(response);
    }
  }

  async ping(req: Request, res: Response): Promise<void> {
    try {
      const { source, destination } = req.body;
      
      const packet = await this.simulationService.ping(source, destination);

      const response: ApiResponse<PacketFlow> = {
        success: true,
        data: packet,
        message: 'Ping packet sent successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to send ping'
      };
      res.status(500).json(response);
    }
  }

  async traceroute(req: Request, res: Response): Promise<void> {
    try {
      const { source, destination } = req.body;
      
      const packets = await this.simulationService.traceroute(source, destination);

      const response: ApiResponse<PacketFlow[]> = {
        success: true,
        data: packets,
        message: 'Traceroute completed successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to perform traceroute'
      };
      res.status(500).json(response);
    }
  }
}
