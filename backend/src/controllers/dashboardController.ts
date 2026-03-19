import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// GET dashboard data
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_code } = req.query;
    const isAdmin = req.user?.profile === 'admin';
    const targetUserCode = isAdmin && user_code ? parseInt(user_code as string) : req.user?.user_code;

    // Get user info
    let userInfo = null;
    if (targetUserCode) {
      const userResult = await pool.query(
        `SELECT user_code, email, first_name, last_name,
                pending_collection_amount, collected_amount, paid_commissions
         FROM users WHERE user_code = $1`,
        [targetUserCode]
      );
      userInfo = userResult.rows[0] || null;
    }

    // Get count of accounts at each level
    let maxLevels = { max_level1: 0, max_level2: 0, max_level3: 0 };
    if (isAdmin && !user_code) {
      // Admin with no filter: show TOTAL COUNT of accounts at each level
      const levelsResult = await pool.query(
        `SELECT
          COUNT(CASE WHEN level_1_date IS NOT NULL THEN 1 END) AS max_level1,
          COUNT(CASE WHEN level_2_date IS NOT NULL THEN 1 END) AS max_level2,
          COUNT(CASE WHEN level_3_date IS NOT NULL THEN 1 END) AS max_level3
         FROM user_accounts`
      );
      maxLevels = levelsResult.rows[0];
    } else if (targetUserCode) {
      // Specific user: show COUNT of accounts at each level
      const levelsResult = await pool.query(
        `SELECT
          COUNT(CASE WHEN level_1_date IS NOT NULL THEN 1 END) AS max_level1,
          COUNT(CASE WHEN level_2_date IS NOT NULL THEN 1 END) AS max_level2,
          COUNT(CASE WHEN level_3_date IS NOT NULL THEN 1 END) AS max_level3
         FROM user_accounts WHERE user_code = $1`,
        [targetUserCode]
      );
      maxLevels = levelsResult.rows[0];
    }

    // Global max account number for progression calculations
    const globalMaxResult = await pool.query(
      `SELECT COALESCE(MAX(account_number), 0) AS global_max FROM user_accounts`
    );
    const globalMax = parseInt(globalMaxResult.rows[0].global_max);

    // Get accounts list
    let accountsQuery = '';
    let accountsParams: any[] = [];

    if (isAdmin && !user_code) {
      // Admin with no filter: last 1000 accounts
      accountsQuery = `
        SELECT ua.account_number, ua.user_code, u.first_name, u.last_name,
               ua.level_1_date, ua.level_2_date, ua.level_3_date
        FROM user_accounts ua
        JOIN users u ON ua.user_code = u.user_code
        ORDER BY ua.account_number DESC LIMIT 1000
      `;
    } else {
      // Specific user accounts
      accountsQuery = `
        SELECT account_number, user_code, level_1_date, level_2_date, level_3_date
        FROM user_accounts WHERE user_code = $1
        ORDER BY account_number ASC
      `;
      accountsParams = [targetUserCode];
    }

    const accountsResult = await pool.query(accountsQuery, accountsParams);

    // Calculate progression for each account
    const accounts = accountsResult.rows.map((acc: any) => {
      const n = acc.account_number;
      const level2At = n * 3;
      const level3At = n * 9;
      const completeAt = n * 27;

      const level2Missing = level2At - globalMax;
      const level3Missing = level3At - globalMax;
      const completeMissing = completeAt - globalMax;

      return {
        ...acc,
        level2_status: acc.level_2_date ? 'completed' : (level2Missing <= 0 ? 'completed' : level2Missing),
        level3_status: acc.level_3_date ? 'completed' : (level3Missing <= 0 ? 'completed' : level3Missing),
        complete_status: completeMissing <= 0 ? 'completed' : completeMissing,
        level2_at: level2At,
        level3_at: level3At,
        complete_at: completeAt
      };
    });

    // Balance summary
    let balanceSummary = { 
      pending_collection_amount: 0, 
      collected_amount: 0, 
      paid_commissions: 0,
      amount_requested: 0 
    };

    if (isAdmin && !user_code) {
      // Admin no filter: sum of all users
      const totalsResult = await pool.query(
        `SELECT
          SUM(pending_collection_amount) AS pending_collection_amount,
          SUM(collected_amount) AS collected_amount,
          SUM(paid_commissions) AS paid_commissions
         FROM users`
      );
      balanceSummary = { ...totalsResult.rows[0], amount_requested: 0 };
      
      // Get total amount requested (pending payments)
      const requestedResult = await pool.query(
        `SELECT COALESCE(SUM(requested_amount), 0) AS amount_requested
         FROM payments_to_users WHERE payment_date IS NULL`
      );
      balanceSummary.amount_requested = parseFloat(requestedResult.rows[0].amount_requested);
    } else if (userInfo) {
      balanceSummary = {
        pending_collection_amount: userInfo.pending_collection_amount,
        collected_amount: userInfo.collected_amount,
        paid_commissions: userInfo.paid_commissions,
        amount_requested: 0
      };
      
      // Get user's amount requested (pending payments)
      const requestedResult = await pool.query(
        `SELECT COALESCE(SUM(requested_amount), 0) AS amount_requested
         FROM payments_to_users WHERE user_code = $1 AND payment_date IS NULL`,
        [targetUserCode]
      );
      balanceSummary.amount_requested = parseFloat(requestedResult.rows[0].amount_requested);
    }

    res.json({
      user_info: userInfo,
      max_levels: maxLevels,
      global_max: globalMax,
      accounts,
      balance_summary: balanceSummary
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
