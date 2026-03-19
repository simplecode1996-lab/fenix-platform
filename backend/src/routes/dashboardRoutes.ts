import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getDashboard);

export default router;
