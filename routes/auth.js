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

// Signup page
router.get('/signup', isNotAuthenticated, (req, res) => {
  res.render('auth/signup', {
    title: 'Sign Up - Ella Rises',
  });
});

// Signup form submission
router.post('/signup', isNotAuthenticated, async (req, res) => {
  const { email, password, confirm_password, first_name, last_name } = req.body;

  // Validate passwords match
  if (password !== confirm_password) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/auth/signup');
  }

  // Validate password length
  if (password.length < 6) {
    req.flash('error', 'Password must be at least 6 characters');
    return res.redirect('/auth/signup');
  }

  try {
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user (always as 'common' role) and get the new user data
    const result = await pool.query(
      `INSERT INTO app_user (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, 'common')
       RETURNING user_id, email, first_name, last_name, role`,
      [email, password_hash, first_name, last_name]
    );

    const newUser = result.rows[0];

    // Auto-login the new user
    req.session.user = {
      id: newUser.user_id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.role,
    };

    // Save session before redirect to ensure login persists
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === '23505') {
      req.flash('error', 'An account with this email already exists');
    } else {
      req.flash('error', 'An error occurred during signup');
    }
    res.redirect('/auth/signup');
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
