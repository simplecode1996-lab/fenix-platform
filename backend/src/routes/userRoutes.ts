import { Router } from 'express';
import { getUsers, getUserByCode, createUser, updateUser } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getUsers);
router.get('/:user_code', authenticateToken, getUserByCode);
router.post('/', authenticateToken, requireAdmin, createUser);
router.put('/:user_code', authenticateToken, updateUser);

export default router;
