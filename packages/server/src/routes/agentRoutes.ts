import { Router } from 'express';
import { agentController } from '../controllers/agentController';
import { enhancedAgentController } from '../controllers/enhanced/enhancedAgentController';

const router = Router();

// Agent service routes
router.post('/initialize', agentController.initializeService);
router.post('/enhanced-initialize', enhancedAgentController.initializeService);
router.post('/enhanced-execute', enhancedAgentController.executeQuery);
router.post('/execute', agentController.executeQuery);
router.get('/enhanced-status', enhancedAgentController.getStatus);
router.get('/status', agentController.getStatus);
router.post('/test', agentController.testAgent);

export default router;
