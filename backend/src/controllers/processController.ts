import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Generate Collection Rights Process
export const generateCollectionRights = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { number_of_payments } = req.body;

    if (!number_of_payments || number_of_payments < 1) {
      res.status(400).json({ error: 'number_of_payments must be at least 1' });
      return;
    }

    let paymentsGenerated = 0;
    const processedAccounts: number[] = [];

    // Get all Level 3 accounts not yet processed, ordered by account number
    const eligibleAccounts = await client.query(
      `SELECT account_number, user_code 
       FROM user_accounts 
       WHERE level_3_date IS NOT NULL 
         AND level_3_processed = FALSE
       ORDER BY account_number ASC`
    );

    for (const account of eligibleAccounts.rows) {
      // Check if account number is divisible by 3
      if (account.account_number % 3 !== 0) {
        // Mark as processed but don't generate payment
        await client.query(
          `UPDATE user_accounts 
           SET level_3_processed = TRUE, updated_at = CURRENT_TIMESTAMP 
           WHERE account_number = $1`,
          [account.account_number]
        );
        continue;
      }

      // Get the completed account number (quotient)
      const completedAccountNumber = account.account_number / 3;

      // Get the owner of the completed account
      const ownerResult = await client.query(
        `SELECT ua.user_code, u.wallet 
         FROM user_accounts ua
         JOIN users u ON ua.user_code = u.user_code
         WHERE ua.account_number = $1`,
        [completedAccountNumber]
      );

      if (ownerResult.rows.length === 0) {
        // Mark as processed and continue
        await client.query(
          `UPDATE user_accounts 
           SET level_3_processed = TRUE, updated_at = CURRENT_TIMESTAMP 
           WHERE account_number = $1`,
          [account.account_number]
        );
        continue;
      }

      const owner = ownerResult.rows[0];

      // Add 500 to user's pending collection amount
      await client.query(
        `UPDATE users 
         SET pending_collection_amount = pending_collection_amount + 500,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_code = $1`,
        [owner.user_code]
      );

      // Mark the Level 3 account as processed
      await client.query(
        `UPDATE user_accounts 
         SET level_3_processed = TRUE, updated_at = CURRENT_TIMESTAMP 
         WHERE account_number = $1`,
        [account.account_number]
      );

      // Create a new zero-value account for the owner
      const nextAccountResult = await client.query(
        `SELECT COALESCE(MAX(account_number), 0) + 1 AS next_number FROM user_accounts`
      );
      const nextAccountNumber = nextAccountResult.rows[0].next_number;

      await client.query(
        `INSERT INTO user_accounts (account_number, user_code, user_wallet, paid_amount, investment_amount)
         VALUES ($1, $2, $3, 0, 0)`,
        [nextAccountNumber, owner.user_code, owner.wallet || null]
      );

      processedAccounts.push(account.account_number);
      paymentsGenerated++;

      // Check if we've reached the requested number of payments
      if (paymentsGenerated >= number_of_payments) {
        break;
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Collection rights generation completed',
      payments_generated: paymentsGenerated,
      processed_accounts: processedAccounts
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Generate collection rights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// Initial Account Generation Process (one-time)
export const initialAccountGeneration = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if already run using system_settings
    const settingCheck = await client.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'initial_generation_completed'`
    );

    if (settingCheck.rows.length > 0 && settingCheck.rows[0].setting_value === 'true') {
      res.status(400).json({ 
        error: 'Initial generation already completed. This process can only run once.'
      });
      return;
    }

    // Get all users ordered by user_code
    const users = await client.query(
      `SELECT user_code, wallet, registered_accounts_count 
       FROM users 
       WHERE registered_accounts_count > 0
       ORDER BY user_code ASC`
    );

    let totalAccountsCreated = 0;
    const accountsCreatedByUser: Record<number, number> = {};

    // Process for each account level (1 to 10)
    for (let accountLevel = 1; accountLevel <= 10; accountLevel++) {
      for (const user of users.rows) {
        // Skip if user doesn't have this many accounts
        if (user.registered_accounts_count < accountLevel) {
          continue;
        }

        // Get next account number
        const nextAccountResult = await client.query(
          `SELECT COALESCE(MAX(account_number), 0) + 1 AS next_number FROM user_accounts`
        );
        const accountNumber = nextAccountResult.rows[0].next_number;

        // Create Level 1 account
        await client.query(
          `INSERT INTO user_accounts (account_number, user_code, user_wallet, paid_amount, investment_amount, level_1_date)
           VALUES ($1, $2, $3, 45, 25, CURRENT_TIMESTAMP)`,
          [accountNumber, user.user_code, user.wallet]
        );

        totalAccountsCreated++;
        accountsCreatedByUser[user.user_code] = (accountsCreatedByUser[user.user_code] || 0) + 1;

        // Check if divisible by 3 -> activate Level 2
        if (accountNumber % 3 === 0) {
          const level2AccountNumber = accountNumber / 3;
          await client.query(
            `UPDATE user_accounts 
             SET level_2_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE account_number = $1 AND level_2_date IS NULL`,
            [level2AccountNumber]
          );

          // Check if quotient is also divisible by 3 -> activate Level 3
          if (level2AccountNumber % 3 === 0) {
            const level3AccountNumber = level2AccountNumber / 3;
            await client.query(
              `UPDATE user_accounts 
               SET level_3_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
               WHERE account_number = $1 AND level_3_date IS NULL`,
              [level3AccountNumber]
            );
          }
        }
      }
    }

    // Mark initial generation as completed
    await client.query(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES ('initial_generation_completed', 'true')
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'true', updated_at = CURRENT_TIMESTAMP`
    );

    await client.query('COMMIT');

    res.json({
      message: 'Initial account generation completed successfully',
      total_accounts_created: totalAccountsCreated,
      accounts_by_user: accountsCreatedByUser,
      users_processed: users.rows.length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Initial generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// Get process statistics
export const getProcessStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_accounts,
        COUNT(CASE WHEN level_1_date IS NOT NULL THEN 1 END) as level_1_count,
        COUNT(CASE WHEN level_2_date IS NOT NULL THEN 1 END) as level_2_count,
        COUNT(CASE WHEN level_3_date IS NOT NULL THEN 1 END) as level_3_count,
        COUNT(CASE WHEN level_3_date IS NOT NULL AND level_3_processed = FALSE THEN 1 END) as pending_level_3,
        COUNT(CASE WHEN level_3_date IS NOT NULL AND level_3_processed = TRUE THEN 1 END) as processed_level_3,
        COUNT(CASE WHEN account_number * 27 <= (SELECT COUNT(*) FROM user_accounts) THEN 1 END) as completed_accounts
      FROM user_accounts
    `);

    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(registered_accounts_count) as total_registered_accounts,
        SUM(pending_collection_amount) as total_pending,
        SUM(collected_amount) as total_collected,
        SUM(paid_commissions) as total_commissions
      FROM users
    `);

    res.json({
      accounts: stats.rows[0],
      users: userStats.rows[0]
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
