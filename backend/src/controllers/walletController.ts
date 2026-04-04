import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// GET all Fenix wallets (all authenticated users)
export const getFenixWallets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Try to get wallets with network column first
    let result;
    try {
      result = await pool.query(
        `SELECT wallet_id, currency, wallet_address, network, created_at
         FROM fenix_wallets ORDER BY currency ASC`
      );
    } catch (networkError: any) {
      // If network column doesn't exist, get without it
      if (networkError.code === '42703') { // column does not exist
        result = await pool.query(
          `SELECT wallet_id, currency, wallet_address, created_at
           FROM fenix_wallets ORDER BY currency ASC`
        );
        // Add default network to each row
        result.rows = result.rows.map((row: any) => ({
          ...row,
          network: 'Ethereum'
        }));
      } else {
        throw networkError;
      }
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST create wallet (admin only)
export const createWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currency, wallet_address, network } = req.body;

    if (!currency || !wallet_address) {
      res.status(400).json({ error: 'Currency and wallet address are required' });
      return;
    }

    // Check if network column exists, if not, insert without it
    let result;
    try {
      result = await pool.query(
        `INSERT INTO fenix_wallets (currency, wallet_address, network)
         VALUES ($1, $2, $3)
         RETURNING wallet_id, currency, wallet_address, network, created_at`,
        [currency, wallet_address, network || 'Ethereum']
      );
    } catch (networkError: any) {
      // If network column doesn't exist, insert without it
      if (networkError.code === '42703') { // column does not exist
        result = await pool.query(
          `INSERT INTO fenix_wallets (currency, wallet_address)
           VALUES ($1, $2)
           RETURNING wallet_id, currency, wallet_address, created_at`,
          [currency, wallet_address]
        );
        // Add network field to response
        result.rows[0].network = network || 'Ethereum';
      } else {
        throw networkError;
      }
    }

    res.status(201).json({ 
      message: 'Wallet created successfully', 
      wallet: result.rows[0] 
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT update wallet (admin only)
export const updateWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wallet_id } = req.params;
    const { currency, wallet_address, network } = req.body;

    if (!currency || !wallet_address) {
      res.status(400).json({ error: 'Currency and wallet address are required' });
      return;
    }

    // Try to update with network column first
    let result;
    try {
      result = await pool.query(
        `UPDATE fenix_wallets 
         SET currency = $1, wallet_address = $2, network = $3, updated_at = CURRENT_TIMESTAMP
         WHERE wallet_id = $4
         RETURNING wallet_id, currency, wallet_address, network, created_at`,
        [currency, wallet_address, network || 'Ethereum', wallet_id]
      );
    } catch (networkError: any) {
      // If network column doesn't exist, update without it
      if (networkError.code === '42703') { // column does not exist
        result = await pool.query(
          `UPDATE fenix_wallets 
           SET currency = $1, wallet_address = $2
           WHERE wallet_id = $3
           RETURNING wallet_id, currency, wallet_address, created_at`,
          [currency, wallet_address, wallet_id]
        );
        // Add network field to response
        if (result.rows.length > 0) {
          result.rows[0].network = network || 'Ethereum';
        }
      } else {
        throw networkError;
      }
    }

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    res.json({ 
      message: 'Wallet updated successfully', 
      wallet: result.rows[0] 
    });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE wallet (admin only)
export const deleteWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wallet_id } = req.params;

    const result = await pool.query(
      'DELETE FROM fenix_wallets WHERE wallet_id = $1 RETURNING wallet_id',
      [wallet_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Delete wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
