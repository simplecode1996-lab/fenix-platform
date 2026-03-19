const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'fenix_platform',
  user: 'postgres',
  password: 'donthesitate1010'
});

async function checkAccounts() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_accounts,
        COUNT(CASE WHEN level_1_date IS NOT NULL THEN 1 END) as level1_count,
        COUNT(CASE WHEN level_2_date IS NOT NULL THEN 1 END) as level2_count,
        COUNT(CASE WHEN level_3_date IS NOT NULL THEN 1 END) as level3_count
      FROM user_accounts
    `);
    
    console.log('Account Statistics:');
    console.log(result.rows[0]);
    
    const accounts = await pool.query('SELECT account_number, user_code, level_1_date, level_2_date, level_3_date FROM user_accounts ORDER BY account_number');
    console.log('\nAll Accounts:');
    console.log(accounts.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkAccounts();
