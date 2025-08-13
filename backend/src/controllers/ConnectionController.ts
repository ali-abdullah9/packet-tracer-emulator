import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Connection } from '../models';
import { NetworkConnection, ApiResponse } from '../types';
import { NetworkSimulationService } from '../services';

export class ConnectionController {
  constructor(private simulationService: NetworkSimulationService) {}

  async getAllConnections(_req: Request, res: Response): Promise<void> {
    try {
      const connections = await Connection.find({}).lean();
      const response: ApiResponse<NetworkConnection[]> = {
        success: true,
        data: connections as NetworkConnection[]
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch connections'
      };
      res.status(500).json(response);
    }
  }

  async createConnection(req: Request, res: Response): Promise<void> {
    try {
      const connectionData: Omit<NetworkConnection, 'id' | 'status'> = req.body;
      const connection: NetworkConnection = {
        ...connectionData,
        id: uuidv4(),
        status: 'connected'
      };

      // Validate that source and target devices exist
      // This would be done in a real implementation

      const savedConnection = await new Connection(connection).save();
      await this.simulationService.addConnection(connection);

      const response: ApiResponse<NetworkConnection> = {
        success: true,
        data: savedConnection.toObject() as NetworkConnection,
        message: 'Connection created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create connection'
      };
      res.status(500).json(response);
    }
  }

  async deleteConnection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const connection = await Connection.findOneAndDelete({ id });
      if (!connection) {
        const response: ApiResponse = {
          success: false,
          error: 'Connection not found'
        };
        res.status(404).json(response);
        return;
      }

      await this.simulationService.removeConnection(id);

      const response: ApiResponse = {
        success: true,
        message: 'Connection deleted successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete connection'
      };
      res.status(500).json(response);
    }
  }

  async updateConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['connected', 'disconnected'].includes(status)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid status value'
        };
        res.status(400).json(response);
        return;
      }

      const connection = await Connection.findOneAndUpdate(
        { id },
        { status },
        { new: true, runValidators: true }
      ).lean();

      if (!connection) {
        const response: ApiResponse = {
          success: false,
          error: 'Connection not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<NetworkConnection> = {
        success: true,
        data: connection as NetworkConnection,
        message: `Connection status updated to ${status}`
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update connection status'
      };
      res.status(500).json(response);
    }
  }
}
