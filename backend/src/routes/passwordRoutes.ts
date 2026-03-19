import { Router } from 'express';
import { changePassword, resetUserPassword, requestPasswordReset } from '../controllers/passwordController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// User changes own password
router.post('/change', authenticateToken, changePassword);

// Admin resets any user's password
router.post('/reset/:user_code', authenticateToken, requireAdmin, resetUserPassword);

// Public endpoint for forgot password
router.post('/forgot', requestPasswordReset);

export default router;
