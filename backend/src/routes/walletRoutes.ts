import { Router } from 'express';
import { getFenixWallets, createWallet, updateWallet, deleteWallet } from '../controllers/walletController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getFenixWallets);
router.post('/', authenticateToken, requireAdmin, createWallet);
router.put('/:wallet_id', authenticateToken, requireAdmin, updateWallet);
router.delete('/:wallet_id', authenticateToken, requireAdmin, deleteWallet);

export default router;
