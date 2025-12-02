// Authentication Routes - Login, logout, register
import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { isNotAuthenticated, isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Login page
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: 'Login - Ella Rises',
  });
});

// Login form submission
router.post('/login', isNotAuthenticated, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT * FROM app_user WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Store user in session
    req.session.user = {
      id: user.user_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'An error occurred during login');
    res.redirect('/auth/login');
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

// Logout via GET (for convenience)
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

export default router;
