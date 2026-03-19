import { Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Change own password (authenticated users)
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { current_password, new_password } = req.body;
    const user_code = req.user?.user_code;

    if (!current_password || !new_password) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_code = $1',
      [user_code]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const new_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_code = $2',
      [new_hash, user_code]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset user password (admin only)
export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_code } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      res.status(400).json({ error: 'New password is required' });
      return;
    }

    // Hash new password
    const new_hash = await bcrypt.hash(new_password, 10);

    // Update password
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_code = $2 RETURNING user_code, email',
      [new_hash, user_code]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ 
      message: 'Password reset successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Request password reset (public - for "forgot password")
export const requestPasswordReset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT user_code, email, first_name FROM users WHERE email = $1',
      [email]
    );

    // Always return success even if email doesn't exist (security best practice)
    if (result.rows.length === 0) {
      res.json({ 
        message: 'If this email exists, a password reset link has been sent',
        note: 'Contact an administrator to reset your password'
      });
      return;
    }

    // In a real system, you'd generate a token and send an email
    // For this closed system, we just return a message to contact admin
    res.json({ 
      message: 'Password reset requested',
      note: 'Please contact an administrator to reset your password',
      user_code: result.rows[0].user_code
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
