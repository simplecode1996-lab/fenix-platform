import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// GET dashboard data
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_code, email, page = '1', limit = '50' } = req.query;
    const isAdmin = req.user?.profile === 'admin';
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let targetUserCode = null;
    
    // Handle search by email or user_code
    if (isAdmin && (user_code || email)) {
      if (email) {
        // Search by email
        const emailResult = await pool.query(
          'SELECT user_code FROM users WHERE email ILIKE $1',
          [`%${email}%`]
        );
        if (emailResult.rows.length > 0) {
          targetUserCode = emailResult.rows[0].user_code;
        }
      } else if (user_code) {
        targetUserCode = parseInt(user_code as string);
      }
    } else if (!isAdmin) {
      targetUserCode = req.user?.user_code;
    }

    // Get user info if specific user
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

    // Get count of accounts at each level - ALWAYS GLOBAL (all users)
    const levelsResult = await pool.query(
      `SELECT
        COUNT(CASE WHEN level_1_date IS NOT NULL THEN 1 END) AS max_level1,
        COUNT(CASE WHEN level_2_date IS NOT NULL THEN 1 END) AS max_level2,
        COUNT(CASE WHEN level_3_date IS NOT NULL THEN 1 END) AS max_level3
       FROM user_accounts`
    );
    const maxLevels = levelsResult.rows[0];

    // Total account count for progression calculations
    const totalAccountsResult = await pool.query(
      `SELECT COALESCE(MAX(account_number), 0) AS total_accounts FROM user_accounts`
    );
    const totalAccounts = parseInt(totalAccountsResult.rows[0].total_accounts);

    // Global max = count of COMPLETE accounts (reached N×27)
    const globalMaxResult = await pool.query(
      `SELECT COUNT(*) AS global_max 
       FROM user_accounts 
       WHERE account_number * 27 <= $1`,
      [totalAccounts]
    );
    const globalMax = parseInt(globalMaxResult.rows[0].global_max);

    // Get accounts list with pagination
    let accountsQuery = '';
    let accountsParams: any[] = [];
    let totalAccountsQuery = '';
    let totalAccountsParams: any[] = [];

    if (isAdmin && !targetUserCode) {
      // Admin with no filter: paginated accounts
      accountsQuery = `
        SELECT ua.account_number, ua.user_code, u.first_name, u.last_name,
               ua.level_1_date, ua.level_2_date, ua.level_3_date
        FROM user_accounts ua
        JOIN users u ON ua.user_code = u.user_code
        ORDER BY ua.account_number DESC 
        LIMIT $1 OFFSET $2
      `;
      accountsParams = [limitNum, offset];
      
      totalAccountsQuery = 'SELECT COUNT(*) as total FROM user_accounts';
      totalAccountsParams = [];
    } else if (targetUserCode) {
      // Specific user accounts
      accountsQuery = `
        SELECT ua.account_number, ua.user_code, u.first_name, u.last_name,
               ua.level_1_date, ua.level_2_date, ua.level_3_date
        FROM user_accounts ua
        JOIN users u ON ua.user_code = u.user_code
        WHERE ua.user_code = $1
        ORDER BY ua.account_number ASC
        LIMIT $2 OFFSET $3
      `;
      accountsParams = [targetUserCode, limitNum, offset];
      
      totalAccountsQuery = 'SELECT COUNT(*) as total FROM user_accounts WHERE user_code = $1';
      totalAccountsParams = [targetUserCode];
    }

    const [accountsResult, totalResult] = await Promise.all([
      pool.query(accountsQuery, accountsParams),
      pool.query(totalAccountsQuery, totalAccountsParams)
    ]);

    const totalRecords = parseInt(totalResult.rows[0]?.total || '0');
    const totalPages = Math.ceil(totalRecords / limitNum);

    // Calculate progression for each account using totalAccounts
    const accounts = accountsResult.rows.map((acc: any) => {
      const n = acc.account_number;
      const level2At = n * 3;
      const level3At = n * 9;
      const completeAt = n * 27;

      const level2Missing = level2At - totalAccounts;
      const level3Missing = level3At - totalAccounts;
      const completeMissing = completeAt - totalAccounts;

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

    if (isAdmin && !targetUserCode) {
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
      balance_summary: balanceSummary,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_records: totalRecords,
        limit: limitNum,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
