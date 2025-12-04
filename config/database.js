/**
 * ============================================================================
 * DATABASE CONFIGURATION
 * ============================================================================
 *
 * Configures and exports a PostgreSQL connection pool using the 'pg' library.
 * Supports both local development and AWS RDS production environments.
 *
 * Environment Variables (in order of precedence):
 *
 * AWS Elastic Beanstalk RDS:
 * - RDS_HOSTNAME: Database host address
 * - RDS_PORT: Database port (default: 5432)
 * - RDS_DB_NAME: Database name
 * - RDS_USERNAME: Database user
 * - RDS_PASSWORD: Database password
 *
 * Local Development:
 * - DB_HOST: Database host (default: localhost)
 * - DB_PORT: Database port (default: 5432)
 * - DB_NAME: Database name (default: ella_rises)
 * - DB_USER: Database user (default: postgres)
 * - DB_PASSWORD: Database password
 *
 * SSL Configuration:
 * - DB_SSL: Set to 'true' to enable SSL connections (required for some RDS configs)
 *
 * ============================================================================
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * PostgreSQL Connection Pool Configuration
 *
 * A connection pool maintains multiple database connections that can be
 * reused, improving performance by avoiding the overhead of creating
 * new connections for each query.
 *
 * Pool Settings:
 * - max: Maximum number of clients in the pool (20)
 * - idleTimeoutMillis: How long a client can be idle before being closed (30s)
 * - connectionTimeoutMillis: How long to wait for a connection (2s)
 */
const pool = new Pool({
  // Connection settings with fallback chain: RDS -> Local -> Default
  host: process.env.RDS_HOSTNAME || process.env.DB_HOST || 'localhost',
  port: process.env.RDS_PORT || process.env.DB_PORT || 5432,
  database: process.env.RDS_DB_NAME || process.env.DB_NAME || 'ella_rises',
  user: process.env.RDS_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD || '',

  // Pool behavior settings
  max: 20,                        // Maximum number of connections in pool
  idleTimeoutMillis: 30000,       // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000,  // Timeout after 2 seconds if can't connect

  // SSL configuration for secure connections (required for some cloud databases)
  // rejectUnauthorized: false allows self-signed certificates
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * Connection Event Handler
 * Logs successful database connections for monitoring
 */
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

/**
 * Error Event Handler
 * Logs database connection errors for debugging
 * Note: The pool will automatically attempt to reconnect
 */
pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Export the pool for use in route handlers
export default pool;
