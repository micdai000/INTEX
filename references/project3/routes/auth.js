import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/database.js';
import { isNotAuthenticated, isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Login page
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    error: req.query.error || null,
    success: req.query.success || null,
  });
});

// Register page
router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    error: req.query.error || null,
  });
});

// Login POST
router.post('/login', isNotAuthenticated, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.redirect('/auth/login?error=Invalid email or password');
    }

    const user = result.rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.hashed_password);

    if (!passwordMatch) {
      return res.redirect('/auth/login?error=Invalid email or password');
    }

    // Set session
    req.session.user = {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      university: user.university,
    };

    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/auth/login?error=An error occurred. Please try again.');
      }
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/auth/login?error=An error occurred. Please try again.');
  }
});

// Register POST
router.post('/register', isNotAuthenticated, async (req, res) => {
  const { email, password, username, university } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.redirect('/auth/register?error=Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (email, hashed_password, username, university) VALUES ($1, $2, $3, $4) RETURNING user_id, email, username, university',
      [email, hashedPassword, username, university]
    );

    const user = result.rows[0];

    // Set session
    req.session.user = {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      university: user.university,
    };

    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/auth/register?error=An error occurred. Please try again.');
      }
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.redirect('/auth/register?error=An error occurred. Please try again.');
  }
});

// Logout
router.post('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

export default router;

