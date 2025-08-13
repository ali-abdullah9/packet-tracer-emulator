import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Device } from '../models';
import { NetworkDevice, ApiResponse, NetworkInterface } from '../types';
import { NetworkSimulationService } from '../services';

export class DeviceController {
  constructor(private simulationService: NetworkSimulationService) {}

  async getAllDevices(_req: Request, res: Response): Promise<void> {
    try {
      const devices = await Device.find({}).lean();
      const response: ApiResponse<NetworkDevice[]> = {
        success: true,
        data: devices as NetworkDevice[]
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch devices'
      };
      res.status(500).json(response);
    }
  }

  async getDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const device = await Device.findOne({ id }).lean();
      
      if (!device) {
        const response: ApiResponse = {
          success: false,
          error: 'Device not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<NetworkDevice> = {
        success: true,
        data: device as NetworkDevice
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch device'
      };
      res.status(500).json(response);
    }
  }

  async createDevice(req: Request, res: Response): Promise<void> {
    try {
      const deviceData: Omit<NetworkDevice, 'id'> = req.body;
      const device: NetworkDevice = {
        ...deviceData,
        id: uuidv4(),
        status: 'offline'
      };

      const savedDevice = await new Device(device).save();
      await this.simulationService.addDevice(device);

      const response: ApiResponse<NetworkDevice> = {
        success: true,
        data: savedDevice.toObject() as NetworkDevice,
        message: 'Device created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create device'
      };
      res.status(500).json(response);
    }
  }

  async updateDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const device = await Device.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!device) {
        const response: ApiResponse = {
          success: false,
          error: 'Device not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<NetworkDevice> = {
        success: true,
        data: device as NetworkDevice,
        message: 'Device updated successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update device'
      };
      res.status(500).json(response);
    }
  }

  async deleteDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const device = await Device.findOneAndDelete({ id });
      if (!device) {
        const response: ApiResponse = {
          success: false,
          error: 'Device not found'
        };
        res.status(404).json(response);
        return;
      }

      await this.simulationService.removeDevice(id);

      const response: ApiResponse = {
        success: true,
        message: 'Device deleted successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to delete device'
      };
      res.status(500).json(response);
    }
  }

  async addInterface(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const interfaceData: NetworkInterface = {
        ...req.body,
        id: uuidv4()
      };

      const device = await Device.findOneAndUpdate(
        { id },
        { $push: { interfaces: interfaceData } },
        { new: true, runValidators: true }
      ).lean();

      if (!device) {
        const response: ApiResponse = {
          success: false,
          error: 'Device not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<NetworkInterface> = {
        success: true,
        data: interfaceData,
        message: 'Interface added successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to add interface'
      };
      res.status(500).json(response);
    }
  }

  async updateInterface(req: Request, res: Response): Promise<void> {
    try {
      const { id, interfaceId } = req.params;
      const updateData = req.body;

      const device = await Device.findOneAndUpdate(
        { id, 'interfaces.id': interfaceId },
        { $set: { 'interfaces.$': { ...updateData, id: interfaceId } } },
        { new: true, runValidators: true }
      ).lean();

      if (!device) {
        const response: ApiResponse = {
          success: false,
          error: 'Device or interface not found'
        };
        res.status(404).json(response);
        return;
      }

      const updatedInterface = device.interfaces?.find((iface: any) => iface.id === interfaceId);

      const response: ApiResponse<NetworkInterface> = {
        success: true,
        data: updatedInterface as NetworkInterface,
        message: 'Interface updated successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update interface'
      };
      res.status(500).json(response);
    }
  }

  async updateDeviceStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['online', 'offline', 'error'].includes(status)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid status value'
        };
        res.status(400).json(response);
        return;
      }

      await this.simulationService.updateDeviceStatus(id, status);

      const response: ApiResponse = {
        success: true,
        message: `Device status updated to ${status}`
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update device status'
      };
      res.status(500).json(response);
    }
  }
}
