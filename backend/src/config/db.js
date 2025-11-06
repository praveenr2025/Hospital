// backend/src/config/db.js

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// ✅ PostgreSQL connection pool configuration
const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT, 10),

  // Pool tuning
  max: 20,                 // max number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 5000, // timeout after 5s if connection fails

  // SSL only in production
  ssl: isProduction
    ? { rejectUnauthorized: false } // allows SSL without verifying CA (since you’re local)
    : false,
};

const pool = new Pool(config);

// Connection event listeners
pool.on('connect', () => console.log('✅ Connected to PostgreSQL'));
pool.on('remove', () => console.log('⚙️  Client removed from pool'));
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🧹 Closing PostgreSQL pool...');
  await pool.end();
  console.log('✅ Pool closed. Exiting.');
  process.exit(0);
});

export default pool;
