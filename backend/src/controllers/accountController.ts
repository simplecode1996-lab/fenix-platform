import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Run account generation logic after creating an account
const runAccountGenerationProcess = async (client: any, newAccountNumber: number): Promise<void> => {
  // Check if divisible by 3 -> activate Level 2 on quotient account
  if (newAccountNumber % 3 === 0) {
    const level2AccountNumber = newAccountNumber / 3;
    await client.query(
      `UPDATE user_accounts SET level_2_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE account_number = $1 AND level_2_date IS NULL`,
      [level2AccountNumber]
    );

    // Check if quotient is also divisible by 3 -> activate Level 3
    if (level2AccountNumber % 3 === 0) {
      const level3AccountNumber = level2AccountNumber / 3;
      await client.query(
        `UPDATE user_accounts SET level_3_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE account_number = $1 AND level_3_date IS NULL`,
        [level3AccountNumber]
      );
    }
  }
};

// GET accounts - admin sees all or filtered by user_code, user sees own
export const getAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_code } = req.query;

    if (req.user?.profile === 'admin') {
      let query = `
        SELECT ua.account_number, ua.user_code, u.first_name, u.last_name,
               ua.paid_amount, ua.investment_amount,
               ua.level_1_date, ua.level_2_date, ua.level_3_date, ua.level_3_processed
        FROM user_accounts ua
        JOIN users u ON ua.user_code = u.user_code
      `;
      const params: any[] = [];

      if (user_code) {
        query += ` WHERE ua.user_code = $1`;
        params.push(user_code);
        query += ` ORDER BY ua.account_number ASC`;
      } else {
        query += ` ORDER BY ua.account_number DESC LIMIT 1000`;
      }

      const result = await pool.query(query, params);
      res.json(result.rows);
    } else {
      // Regular user sees only their accounts
      const result = await pool.query(
        `SELECT account_number, user_code, paid_amount, investment_amount,
                level_1_date, level_2_date, level_3_date, level_3_processed
         FROM user_accounts WHERE user_code = $1 ORDER BY account_number ASC`,
        [req.user?.user_code]
      );
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET max account numbers per level for a user
export const getMaxAccountLevels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userCode = req.query.user_code || req.user?.user_code;

    const result = await pool.query(
      `SELECT
        MAX(CASE WHEN level_1_date IS NOT NULL THEN account_number END) AS max_level1,
        MAX(CASE WHEN level_2_date IS NOT NULL THEN account_number END) AS max_level2,
        MAX(CASE WHEN level_3_date IS NOT NULL THEN account_number END) AS max_level3
       FROM user_accounts WHERE user_code = $1`,
      [userCode]
    );

    // Global max account number for progression calculations
    const globalMax = await pool.query(
      `SELECT MAX(account_number) AS global_max FROM user_accounts`
    );

    res.json({
      ...result.rows[0],
      global_max: globalMax.rows[0].global_max || 0
    });
  } catch (error) {
    console.error('Get max levels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST create account for user (admin only)
export const createAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { user_code } = req.body;

    if (!user_code) {
      res.status(400).json({ error: 'user_code is required' });
      return;
    }

    // Get user and validate
    const userResult = await client.query(
      `SELECT user_code, first_name, last_name, wallet,
              registered_accounts_count, allowed_accounts_count
       FROM users WHERE user_code = $1 FOR UPDATE`,
      [user_code]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    // Validate account limit
    if (user.registered_accounts_count >= user.allowed_accounts_count) {
      res.status(400).json({
        error: `User has reached the maximum allowed accounts (${user.allowed_accounts_count})`
      });
      return;
    }

    // Get next account number with lock
    const maxResult = await client.query(
      `SELECT COALESCE(MAX(account_number), 0) + 1 AS next_number FROM user_accounts`
    );
    const nextAccountNumber = maxResult.rows[0].next_number;

    // Create the account
    const accountResult = await client.query(
      `INSERT INTO user_accounts (account_number, user_code, user_wallet, paid_amount, investment_amount, level_1_date)
       VALUES ($1, $2, $3, 45, 25, CURRENT_TIMESTAMP)
       RETURNING *`,
      [nextAccountNumber, user_code, user.wallet]
    );

    // Increment user's registered accounts count
    await client.query(
      `UPDATE users SET registered_accounts_count = registered_accounts_count + 1,
       updated_at = CURRENT_TIMESTAMP WHERE user_code = $1`,
      [user_code]
    );

    // Run account generation process
    await runAccountGenerationProcess(client, nextAccountNumber);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Account created successfully',
      account: accountResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// GET global max account number
export const getGlobalMaxAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(MAX(account_number), 0) AS global_max FROM user_accounts`
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get global max error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
