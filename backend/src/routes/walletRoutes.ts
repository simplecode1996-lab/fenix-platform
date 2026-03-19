import { Router } from 'express';
import { getFenixWallets } from '../controllers/walletController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getFenixWallets);

export default router;
