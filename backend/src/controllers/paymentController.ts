import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// GET payments - admin sees all/filtered, user sees own
export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.profile === 'admin') {
      const { user_code } = req.query;
      let query = `
        SELECT p.*, u.first_name, u.last_name, u.email
        FROM payments_to_users p
        JOIN users u ON p.user_code = u.user_code
      `;
      const params: any[] = [];

      if (user_code) {
        query += ` WHERE p.user_code = $1 ORDER BY p.request_date DESC`;
        params.push(user_code);
      } else {
        query += ` ORDER BY p.request_date DESC`;
      }

      const result = await pool.query(query, params);
      res.json(result.rows);
    } else {
      const result = await pool.query(
        `SELECT * FROM payments_to_users WHERE user_code = $1 ORDER BY request_date DESC`,
        [req.user?.user_code]
      );
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST request payment (user)
export const requestPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { requested_amount } = req.body;
    const user_code = req.user?.user_code;

    if (!requested_amount || requested_amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    // Get user balance
    const userResult = await client.query(
      `SELECT pending_collection_amount FROM users WHERE user_code = $1 FOR UPDATE`,
      [user_code]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const pendingBalance = parseFloat(userResult.rows[0].pending_collection_amount);

    if (requested_amount > pendingBalance) {
      res.status(400).json({
        error: 'The requested amount cannot exceed the Available Balance.'
      });
      return;
    }

    const net_amount = parseFloat((requested_amount * 0.98).toFixed(2));
    const commission_amount = parseFloat((requested_amount * 0.02).toFixed(2));

    // Create payment request
    const result = await client.query(
      `INSERT INTO payments_to_users (user_code, requested_amount, net_amount, commission_amount)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_code, requested_amount, net_amount, commission_amount]
    );

    // Decrease pending_collection_amount immediately
    await client.query(
      `UPDATE users 
       SET pending_collection_amount = pending_collection_amount - $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_code = $2`,
      [requested_amount, user_code]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Payment request created successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Request payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// PUT mark payment as completed (admin only)
export const completePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { payment_id } = req.params;
    const { payment_date } = req.body;

    // Get payment record
    const paymentResult = await client.query(
      `SELECT * FROM payments_to_users WHERE payment_id = $1 FOR UPDATE`,
      [payment_id]
    );

    if (paymentResult.rows.length === 0) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const payment = paymentResult.rows[0];

    if (payment.payment_date) {
      res.status(400).json({ error: 'Payment already completed' });
      return;
    }

    // Mark payment as completed
    await client.query(
      `UPDATE payments_to_users SET payment_date = $1, updated_at = CURRENT_TIMESTAMP
       WHERE payment_id = $2`,
      [payment_date || new Date(), payment_id]
    );

    // Update user balances (only collected_amount and paid_commissions, pending already decreased)
    await client.query(
      `UPDATE users SET
        collected_amount = collected_amount + $1,
        paid_commissions = paid_commissions + $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_code = $3`,
      [payment.net_amount, payment.commission_amount, payment.user_code]
    );

    await client.query('COMMIT');

    res.json({ message: 'Payment completed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Complete payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
