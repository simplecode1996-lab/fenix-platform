const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'fenix_platform',
  user: 'postgres',
  password: 'donthesitate1010'
});

async function migrate() {
  try {
    console.log('Adding system_settings table...');
    
    const sql = fs.readFileSync('backend/database/add_system_settings.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✓ System settings table added successfully!');
    
    // Verify the table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'system_settings'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Table verified in database');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
