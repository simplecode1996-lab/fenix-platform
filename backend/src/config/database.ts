import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL if available (production), otherwise use individual env vars (local)
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout for Supabase
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      database: process.env.DB_NAME || 'fenix_platform',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

// Test connection
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err: Error) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Log connection config (without password)
console.log('Database configuration:', {
  usingConnectionString: !!process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? 'from DATABASE_URL' : (process.env.DB_HOST || 'localhost'),
  port: process.env.DATABASE_URL ? 'from DATABASE_URL' : (process.env.DB_PORT || '5433'),
  database: process.env.DATABASE_URL ? 'from DATABASE_URL' : (process.env.DB_NAME || 'fenix_platform')
});

export default pool;
