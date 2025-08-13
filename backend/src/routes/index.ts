import { Router } from 'express';
import { 
  DeviceController, 
  ConnectionController, 
  NetworkController, 
  SimulationController, 
  PacketController 
} from '../controllers';
import { createDeviceRoutes } from './devices';
import { createConnectionRoutes } from './connections';
import { createNetworkRoutes } from './networks';
import { createSimulationRoutes } from './simulation';
import { createPacketRoutes } from './packets';

export function createApiRoutes(
  deviceController: DeviceController,
  connectionController: ConnectionController,
  networkController: NetworkController,
  simulationController: SimulationController,
  packetController: PacketController
): Router {
  const router = Router();

  router.use('/devices', createDeviceRoutes(deviceController));
  router.use('/connections', createConnectionRoutes(connectionController));
  router.use('/networks', createNetworkRoutes(networkController));
  router.use('/simulation', createSimulationRoutes(simulationController));
  router.use('/packets', createPacketRoutes(packetController));

  return router;
}
