import { Router } from 'express';
import { PacketController } from '../controllers';
import { validateRequest } from '../middleware';
import { sendPacketSchema } from '../middleware/validation';

export function createPacketRoutes(packetController: PacketController): Router {
  const router = Router();

  router.post('/send', validateRequest(sendPacketSchema), packetController.sendPacket.bind(packetController));
  router.get('/history', packetController.getPacketHistory.bind(packetController));
  router.post('/ping', packetController.ping.bind(packetController));
  router.post('/traceroute', packetController.traceroute.bind(packetController));

  return router;
}
