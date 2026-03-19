import { Router } from 'express';
import { generateCollectionRights, getCollectionRightsStats } from '../controllers/collectionRightsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticateToken, requireAdmin, generateCollectionRights);
router.get('/stats', authenticateToken, requireAdmin, getCollectionRightsStats);

export default router;
