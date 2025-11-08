// backend/src/config/db.js

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); 

// Configuration object for the PostgreSQL connection
const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  // Ensure the port is parsed as an integer
  port: parseInt(process.env.DB_PORT, 10), 
};

// Create the connection pool
const pool = new Pool(config);

// Log successful connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

// Handle connection errors
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1); // Exit the process if a critical error occurs
});

// Export the pool so other files (like dbService.js) can run queries
export default pool;
