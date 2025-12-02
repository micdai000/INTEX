// Database Configuration - PostgreSQL Connection Pool
// Supports both local development and AWS RDS production

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool with fallback to environment variables
const pool = new Pool({
  host: process.env.RDS_HOSTNAME || process.env.DB_HOST || 'localhost',
  port: process.env.RDS_PORT || process.env.DB_PORT || 5432,
  database: process.env.RDS_DB_NAME || process.env.DB_NAME || 'ella_rises',
  user: process.env.RDS_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Log successful connections
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Handle connection errors gracefully
pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

export default pool;
