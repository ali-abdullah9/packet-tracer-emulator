import { Router } from 'express';
import { SimulationController } from '../controllers';

export function createSimulationRoutes(simulationController: SimulationController): Router {
  const router = Router();

  router.get('/status', simulationController.getStatus.bind(simulationController));
  router.post('/start', simulationController.start.bind(simulationController));
  router.post('/stop', simulationController.stop.bind(simulationController));
  router.post('/reset', simulationController.reset.bind(simulationController));

  return router;
}
