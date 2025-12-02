import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.RDS_HOSTNAME || process.env.DB_HOST || 'localhost',
  port: process.env.RDS_PORT || process.env.DB_PORT || 5432,
  database: process.env.RDS_DB_NAME || process.env.DB_NAME || 'provo_crib_connect',
  user: process.env.RDS_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit - just log the error
});

export default pool;

