-- ============================================
-- App User Table for Authentication
-- Add this to ella_rises_database.sql BEFORE running on RDS
-- ============================================

-- Drop if exists (add this near other DROP TABLE statements at the top)
DROP TABLE IF EXISTS app_user CASCADE;

-- ============================================
-- Create app_user table (add after other CREATE TABLE statements)
-- ============================================
CREATE TABLE app_user (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'common',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster email lookups
CREATE INDEX idx_app_user_email ON app_user(email);

-- ============================================
-- Insert test users (add at the end with other INSERT statements)
-- Password for both users is: password
-- ============================================
INSERT INTO app_user (email, password_hash, first_name, last_name, role) VALUES
('admin@test.com', '$2b$10$wzz8o3nhiLmrfYEPnQdbWOdfCl98BQ38RlpSO/nuqXVcfnbwRUrp2', 'Admin', 'User', 'manager'),
('user@test.com', '$2b$10$wzz8o3nhiLmrfYEPnQdbWOdfCl98BQ38RlpSO/nuqXVcfnbwRUrp2', 'Test', 'User', 'common');
