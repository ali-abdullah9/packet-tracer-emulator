import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Network } from '../models';
import { NetworkTopology, ApiResponse } from '../types';

export class NetworkController {
  async getAllNetworks(_req: Request, res: Response): Promise<void> {
    try {
      const networks = await Network.find({}).populate('devices').populate('connections').lean();
      const response: ApiResponse<NetworkTopology[]> = {
        success: true,
        data: networks as unknown as NetworkTopology[]
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch networks'
      };
      res.status(500).json(response);
    }
  }

  async getNetwork(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const network = await Network.findOne({ id }).populate('devices').populate('connections').lean();
      
      if (!network) {
        const response: ApiResponse = {
          success: false,
          error: 'Network not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<NetworkTopology> = {
        success: true,
        data: network as unknown as NetworkTopology
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch network'
      };
      res.status(500).json(response);
    }
  }

  async createNetwork(req: Request, res: Response): Promise<void> {
    try {
      const networkData: Omit<NetworkTopology, 'id' | 'createdAt' | 'updatedAt'> = req.body;
      const network: Partial<NetworkTopology> = {
        ...networkData,
        id: uuidv4()
      };

      const savedNetwork = await new Network(network).save();

      const response: ApiResponse<NetworkTopology> = {
        success: true,
        data: savedNetwork.toObject() as unknown as NetworkTopology,
        message: 'Network created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create network'
      };
      res.status(500).json(response);
    }
  }

  async updateNetwork(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const network = await Network.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      ).populate('devices').populate('connections').lean();

      if (!network) {
        const response: ApiResponse = {
          success: false,
          error: 'Network not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<NetworkTopology> = {
        success: true,
        data: network as unknown as NetworkTopology,
        message: 'Network updated successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update network'
      };
      res.status(500).json(response);
    }
  }

  async deleteNetwork(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const network = await Network.findOneAndDelete({ id });
      if (!network) {
        const response: ApiResponse = {
          success: false,
          error: 'Network not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Network deleted successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete network'
      };
      res.status(500).json(response);
    }
  }
}
