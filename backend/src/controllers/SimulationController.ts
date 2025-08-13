import { Request, Response } from 'express';
import { ApiResponse, PacketFlow } from '../types';
import { NetworkSimulationService } from '../services';

export class SimulationController {
  constructor(private simulationService: NetworkSimulationService) {}

  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const state = this.simulationService.getSimulationState();
      const response: ApiResponse = {
        success: true,
        data: {
          isRunning: state.isRunning,
          deviceCount: state.devices.length,
          connectionCount: state.connections.length,
          activePackets: state.packets.filter(p => p.status === 'pending' || p.status === 'transmitted').length
        }
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get simulation status'
      };
      res.status(500).json(response);
    }
  }

  async start(req: Request, res: Response): Promise<void> {
    try {
      this.simulationService.startSimulation();
      const response: ApiResponse = {
        success: true,
        message: 'Simulation started successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to start simulation'
      };
      res.status(500).json(response);
    }
  }

  async stop(req: Request, res: Response): Promise<void> {
    try {
      this.simulationService.stopSimulation();
      const response: ApiResponse = {
        success: true,
        message: 'Simulation stopped successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to stop simulation'
      };
      res.status(500).json(response);
    }
  }

  async reset(req: Request, res: Response): Promise<void> {
    try {
      this.simulationService.resetSimulation();
      const response: ApiResponse = {
        success: true,
        message: 'Simulation reset successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to reset simulation'
      };
      res.status(500).json(response);
    }
  }
}
