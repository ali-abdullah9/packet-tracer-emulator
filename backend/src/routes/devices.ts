import { Router } from 'express';
import { DeviceController } from '../controllers';
import { validateRequest } from '../middleware';
import { createDeviceSchema, updateDeviceSchema, interfaceConfigSchema } from '../middleware/validation';

export function createDeviceRoutes(deviceController: DeviceController): Router {
  const router = Router();

  router.get('/', deviceController.getAllDevices.bind(deviceController));
  router.get('/:id', deviceController.getDevice.bind(deviceController));
  router.post('/', validateRequest(createDeviceSchema), deviceController.createDevice.bind(deviceController));
  router.put('/:id', validateRequest(updateDeviceSchema), deviceController.updateDevice.bind(deviceController));
  router.delete('/:id', deviceController.deleteDevice.bind(deviceController));
  
  // Interface management
  router.post('/:id/interfaces', deviceController.addInterface.bind(deviceController));
  router.put('/:id/interfaces/:interfaceId', validateRequest(interfaceConfigSchema), deviceController.updateInterface.bind(deviceController));
  
  // Device status management
  router.patch('/:id/status', deviceController.updateDeviceStatus.bind(deviceController));

  return router;
}
