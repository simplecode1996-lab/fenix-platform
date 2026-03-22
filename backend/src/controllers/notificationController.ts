import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Get all notifications (admin only)
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.first_name, u.last_name, u.email
       FROM notifications n
       LEFT JOIN users u ON n.user_code = u.user_code
       ORDER BY n.created_at DESC
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unread count (admin only)
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE'
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notification as read (admin only)
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notification_id } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = $1',
      [notification_id]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark all as read (admin only)
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
