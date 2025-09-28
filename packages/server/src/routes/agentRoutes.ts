import { Router } from 'express';
import { agentController } from '../controllers/agentController';

const router = Router();

// Agent service routes
router.post('/initialize', agentController.initializeService);
router.post('/execute', agentController.executeQuery);
router.get('/status', agentController.getStatus);
router.post('/test', agentController.testAgent);

export default router;
