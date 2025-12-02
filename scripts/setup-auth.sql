-- Ella Rises - App User Table Setup
-- Run this AFTER importing ella_rises_database.sql

-- Create app_user table for authentication
CREATE TABLE IF NOT EXISTS app_user (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'common',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user(email);

-- Insert default manager account
-- Password: 'password' (hashed with bcrypt, 10 rounds)
-- You can generate a new hash using: const bcrypt = require('bcrypt'); bcrypt.hashSync('password', 10);
INSERT INTO app_user (email, password_hash, first_name, last_name, role)
VALUES (
  'kimballberrett@gmail.com',
  '$2b$10$rQZ9QxPvn.H8TKj8H0KtOeYIKjB/LZvDMuMcqXzK1RjMvXxJ9XzGu',
  'Kimball',
  'Berrett',
  'manager'
) ON CONFLICT (email) DO NOTHING;

-- Optional: Create a common user for testing
INSERT INTO app_user (email, password_hash, first_name, last_name, role)
VALUES (
  'user@ellarises.org',
  '$2b$10$rQZ9QxPvn.H8TKj8H0KtOeYIKjB/LZvDMuMcqXzK1RjMvXxJ9XzGu',
  'Test',
  'User',
  'common'
) ON CONFLICT (email) DO NOTHING;
