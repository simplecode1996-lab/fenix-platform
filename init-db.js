const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres:fenix123#@!@@db.bhtosjlllltsimoyabis.supabase.co:5432/postgres';

async function initializeDatabase() {
  const client = new Client({
    host: 'db.bhtosjlllltsimoyabis.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'fenix123#@!@',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    query_timeout: 30000
  });

  try {
    console.log('Connecting to Supabase database...');
    await client.connect();
    console.log('✓ Connected!');

    console.log('1. Creating schema...');
    const schema = fs.readFileSync('backend/database/schema.sql', 'utf8');
    await client.query(schema);
    console.log('✓ Schema created!');

    console.log('2. Adding system settings...');
    const systemSettings = fs.readFileSync('backend/database/add_system_settings.sql', 'utf8');
    await client.query(systemSettings);
    console.log('✓ System settings added!');

    console.log('3. Loading demo data...');
    const demoData = fs.readFileSync('backend/database/demo_data.sql', 'utf8');
    await client.query(demoData);
    console.log('✓ Demo data loaded!');

    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`✓ Users: ${userCount.rows[0].count}`);

    console.log('🎉 Database ready!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

initializeDatabase();
