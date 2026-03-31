import { Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// GET all users (admin) or current user (user)
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.profile === 'admin') {
      const result = await pool.query(
        `SELECT user_code, email, first_name, last_name, profile, wallet, phone, dni,
                registered_accounts_count, allowed_accounts_count,
                pending_collection_amount, collected_amount, paid_commissions, currency
         FROM users ORDER BY user_code ASC`
      );
      res.json(result.rows);
    } else {
      const result = await pool.query(
        `SELECT user_code, email, first_name, last_name, profile, wallet, phone, dni,
                registered_accounts_count, allowed_accounts_count,
                pending_collection_amount, collected_amount, paid_commissions, currency
         FROM users WHERE user_code = $1`,
        [req.user?.user_code]
      );
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single user by code
export const getUserByCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_code } = req.params;
    const result = await pool.query(
      `SELECT user_code, email, first_name, last_name, profile, wallet, phone, dni,
              registered_accounts_count, allowed_accounts_count,
              pending_collection_amount, collected_amount, paid_commissions, currency
       FROM users WHERE user_code = $1`,
      [user_code]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST create user (admin only)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, first_name, last_name, profile, wallet, phone, dni, allowed_accounts_count, password } = req.body;

    if (!email || !first_name || !last_name || !profile || !password) {
      res.status(400).json({ error: 'Email, name, profile and password are required' });
      return;
    }

    // Check email uniqueness
    const existing = await pool.query('SELECT user_code FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, profile, wallet, phone, dni, allowed_accounts_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING user_code, email, first_name, last_name, profile, wallet, phone, dni, allowed_accounts_count`,
      [email, password_hash, first_name, last_name, profile, wallet || null, phone || null, dni || null, allowed_accounts_count || 10]
    );

    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT update user
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_code } = req.params;

    // Users can only update themselves
    if (req.user?.profile !== 'admin' && req.user?.user_code !== parseInt(user_code)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { first_name, last_name, wallet, phone, dni, profile, allowed_accounts_count, registered_accounts_count, currency } = req.body;

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (first_name !== undefined) { fields.push(`first_name = $${idx++}`); values.push(first_name); }
    if (last_name !== undefined) { fields.push(`last_name = $${idx++}`); values.push(last_name); }
    if (wallet !== undefined) { fields.push(`wallet = $${idx++}`); values.push(wallet); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
    if (dni !== undefined) { fields.push(`dni = $${idx++}`); values.push(dni); }
    if (currency !== undefined) { fields.push(`currency = $${idx++}`); values.push(currency); }

    // Admin-only fields
    if (req.user?.profile === 'admin') {
      if (profile !== undefined) { fields.push(`profile = $${idx++}`); values.push(profile); }
      if (allowed_accounts_count !== undefined) { fields.push(`allowed_accounts_count = $${idx++}`); values.push(allowed_accounts_count); }
      if (registered_accounts_count !== undefined) { fields.push(`registered_accounts_count = $${idx++}`); values.push(registered_accounts_count); }
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(user_code);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_code = $${idx}
       RETURNING user_code, email, first_name, last_name, profile, wallet, phone, dni, allowed_accounts_count, registered_accounts_count, currency`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
