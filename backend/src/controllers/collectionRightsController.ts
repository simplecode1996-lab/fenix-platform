import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

interface ProcessResult {
  account_number: number;
  user_code: number;
  completed_account_number: number;
  amount_added: number;
  new_account_created: number;
}

export const generateCollectionRights = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { number_of_payments } = req.body;

    if (!number_of_payments || number_of_payments < 1) {
      res.status(400).json({ error: 'Number of payments must be at least 1' });
      return;
    }

    const eligibleAccounts = await client.query(
      `SELECT account_number, user_code 
       FROM user_accounts 
       WHERE level_3_date IS NOT NULL 
         AND level_3_processed = FALSE
       ORDER BY account_number ASC`
    );

    let paymentsGenerated = 0;
    const processedResults: ProcessResult[] = [];

    for (const account of eligibleAccounts.rows) {
      const accountNumber = account.account_number;

      if (accountNumber % 3 !== 0) {
        await client.query(
          `UPDATE user_accounts 
           SET level_3_processed = TRUE, updated_at = CURRENT_TIMESTAMP 
           WHERE account_number = $1`,
          [accountNumber]
        );
        continue;
      }

      const completedAccountNumber = accountNumber / 3;

      const ownerResult = await client.query(
        `SELECT user_code, wallet FROM user_accounts WHERE account_number = $1`,
        [completedAccountNumber]
      );

      if (ownerResult.rows.length === 0) {
        await client.query(
          `UPDATE user_accounts 
           SET level_3_processed = TRUE, updated_at = CURRENT_TIMESTAMP 
           WHERE account_number = $1`,
          [accountNumber]
        );
        continue;
      }

      const ownerUserCode = ownerResult.rows[0].user_code;
      const ownerWallet = ownerResult.rows[0].wallet;

      await client.query(
        `UPDATE users 
         SET pending_collection_amount = pending_collection_amount + 500,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_code = $1`,
        [ownerUserCode]
      );

      await client.query(
        `UPDATE user_accounts 
         SET level_3_processed = TRUE, updated_at = CURRENT_TIMESTAMP 
         WHERE account_number = $1`,
        [accountNumber]
      );

      const nextAccountResult = await client.query(
        `SELECT COALESCE(MAX(account_number), 0) + 1 AS next_number FROM user_accounts`
      );
      const newAccountNumber = nextAccountResult.rows[0].next_number;

      await client.query(
        `INSERT INTO user_accounts 
         (account_number, user_code, user_wallet, paid_amount, investment_amount)
         VALUES ($1, $2, $3, 0, 0)`,
        [newAccountNumber, ownerUserCode, ownerWallet]
      );

      paymentsGenerated++;

      processedResults.push({
        account_number: accountNumber,
        user_code: ownerUserCode,
        completed_account_number: completedAccountNumber,
        amount_added: 500,
        new_account_created: newAccountNumber
      });

      if (paymentsGenerated >= number_of_payments) {
        break;
      }
    }

    await client.query('COMMIT');

    res.json({
      message: `Successfully generated ${paymentsGenerated} collection rights`,
      payments_generated: paymentsGenerated,
      requested: number_of_payments,
      details: processedResults
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Generate collection rights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const getCollectionRightsStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const eligibleResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM user_accounts 
       WHERE level_3_date IS NOT NULL 
         AND level_3_processed = FALSE
         AND account_number % 3 = 0`
    );

    const totalLevel3Result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM user_accounts 
       WHERE level_3_date IS NOT NULL 
         AND level_3_processed = FALSE`
    );

    const nextEligibleResult = await pool.query(
      `SELECT ua.account_number, ua.user_code, u.first_name, u.last_name,
              (ua.account_number / 3) as completed_account_number
       FROM user_accounts ua
       JOIN users u ON ua.user_code = u.user_code
       WHERE ua.level_3_date IS NOT NULL 
         AND ua.level_3_processed = FALSE
         AND ua.account_number % 3 = 0
       ORDER BY ua.account_number ASC
       LIMIT 10`
    );

    res.json({
      eligible_for_payment: parseInt(eligibleResult.rows[0].count),
      total_level3_pending: parseInt(totalLevel3Result.rows[0].count),
      next_eligible_accounts: nextEligibleResult.rows
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
