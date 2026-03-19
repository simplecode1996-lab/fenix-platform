import { Router } from 'express';
import { getAccounts, createAccount, getMaxAccountLevels, getGlobalMaxAccount } from '../controllers/accountController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAccounts);
router.get('/max-levels', authenticateToken, getMaxAccountLevels);
router.get('/global-max', authenticateToken, getGlobalMaxAccount);
router.post('/', authenticateToken, requireAdmin, createAccount);

export default router;
