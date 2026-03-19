import { Router } from 'express';
import { getPayments, requestPayment, completePayment } from '../controllers/paymentController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getPayments);
router.post('/request', authenticateToken, requestPayment);
router.put('/:payment_id/complete', authenticateToken, requireAdmin, completePayment);

export default router;
