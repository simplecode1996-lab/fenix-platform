import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// GET all Fenix wallets (all authenticated users)
export const getFenixWallets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT wallet_id, currency, wallet_address, created_at
       FROM fenix_wallets ORDER BY currency ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
