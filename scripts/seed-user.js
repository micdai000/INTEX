// Seed script to create the initial manager user
// Run this after setting up the database: node scripts/seed-user.js

import bcrypt from 'bcrypt';
import pool from '../config/database.js';

async function seedUser() {
  try {
    // First, create the app_user table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_user (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'common',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('app_user table created/verified');

    // Hash the password
    const password = 'password';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert manager user
    await pool.query(`
      INSERT INTO app_user (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $2,
        first_name = $3,
        last_name = $4,
        role = $5
    `, ['kimballberrett@gmail.com', passwordHash, 'Kimball', 'Berrett', 'manager']);

    console.log('Manager user created: kimballberrett@gmail.com / password');

    // Insert test common user
    await pool.query(`
      INSERT INTO app_user (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['user@ellarises.org', passwordHash, 'Test', 'User', 'common']);

    console.log('Test user created: user@ellarises.org / password');

    console.log('\nSetup complete! You can now run: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding user:', err);
    process.exit(1);
  }
}

seedUser();
