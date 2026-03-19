import { Router } from 'express';
import { generateCollectionRights, initialAccountGeneration, getProcessStats } from '../controllers/processController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Admin only - run collection rights generation
router.post('/generate-rights', authenticateToken, requireAdmin, generateCollectionRights);

// Admin only - run initial account generation (one-time)
router.post('/initial-generation', authenticateToken, requireAdmin, initialAccountGeneration);

// Admin only - get process statistics
router.get('/stats', authenticateToken, requireAdmin, getProcessStats);

export default router;
