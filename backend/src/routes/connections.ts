import { Router } from 'express';
import { ConnectionController } from '../controllers';
import { validateRequest } from '../middleware';
import { createConnectionSchema } from '../middleware/validation';

export function createConnectionRoutes(connectionController: ConnectionController): Router {
  const router = Router();

  router.get('/', connectionController.getAllConnections.bind(connectionController));
  router.post('/', validateRequest(createConnectionSchema), connectionController.createConnection.bind(connectionController));
  router.delete('/:id', connectionController.deleteConnection.bind(connectionController));
  router.patch('/:id/status', connectionController.updateConnectionStatus.bind(connectionController));

  return router;
}
