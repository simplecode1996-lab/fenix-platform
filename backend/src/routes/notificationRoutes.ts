import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:notification_id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

export default router;
