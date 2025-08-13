import { Router } from 'express';
import { NetworkController } from '../controllers';
import { validateRequest } from '../middleware';
import { createNetworkSchema, updateNetworkSchema } from '../middleware/validation';

export function createNetworkRoutes(networkController: NetworkController): Router {
  const router = Router();

  router.get('/', networkController.getAllNetworks.bind(networkController));
  router.get('/:id', networkController.getNetwork.bind(networkController));
  router.post('/', validateRequest(createNetworkSchema), networkController.createNetwork.bind(networkController));
  router.put('/:id', validateRequest(updateNetworkSchema), networkController.updateNetwork.bind(networkController));
  router.delete('/:id', networkController.deleteNetwork.bind(networkController));

  return router;
}
