/**
 * ============================================================================
 * AUTHENTICATION ROUTES
 * ============================================================================
 *
 * Handles all user authentication operations including:
 * - User login with email/password
 * - New user registration (signup)
 * - User logout (session destruction)
 *
 * Security Features:
 * - Passwords are hashed using bcrypt with salt rounds
 * - Session-based authentication with secure cookies
 * - Protection against duplicate email registration
 * - Input validation for password requirements
 *
 * ============================================================================
 */

import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { isNotAuthenticated, isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// =============================================================================
// LOGIN ROUTES
// =============================================================================

/**
 * GET /auth/login
 * Displays the login page
 * Only accessible to non-authenticated users (redirects if already logged in)
 */
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: 'Login - Ella Rises',
  });
});

/**
 * POST /auth/login
 * Processes login form submission
 *
 * Request Body:
 * - email: User's email address
 * - password: User's password (plain text, compared against hash)
 *
 * Flow:
 * 1. Query database for user by email
 * 2. Compare provided password with stored hash using bcrypt
 * 3. Create session with user data on success
 * 4. Redirect to dashboard or show error
 */
router.post('/login', isNotAuthenticated, async (req, res) => {
  const { email, password } = req.body;

  // Log login attempts for debugging (email only, never password)
  console.log('Login attempt for email:', email);

  try {
    // Query the app_user table for matching email
    const result = await pool.query(
      'SELECT * FROM app_user WHERE email = $1',
      [email]
    );

    console.log('User found:', result.rows.length > 0);

    // Check if user exists
    if (result.rows.length === 0) {
      console.log('No user found with email:', email);
      req.flash('error', 'Invalid email or password');
      return req.session.save(() => res.redirect('/auth/login'));
    }

    const user = result.rows[0];

    // Verify password using bcrypt compare
    // This compares the plain text password with the stored hash
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      req.flash('error', 'Invalid email or password');
      return req.session.save(() => res.redirect('/auth/login'));
    }

    // Store essential user data in session
    // Avoid storing sensitive data like password hash
    req.session.user = {
      id: user.user_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role, // 'manager' or 'common'
    };

    // Explicitly save session before redirect
    // This ensures the session is persisted, especially important in production
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'An error occurred during login');
    req.session.save(() => res.redirect('/auth/login'));
  }
});

// =============================================================================
// SIGNUP (REGISTRATION) ROUTES
// =============================================================================

/**
 * GET /auth/signup
 * Displays the registration page
 * Only accessible to non-authenticated users
 */
router.get('/signup', isNotAuthenticated, (req, res) => {
  res.render('auth/signup', {
    title: 'Sign Up - Ella Rises',
  });
});

/**
 * POST /auth/signup
 * Processes new user registration
 *
 * Request Body:
 * - email: User's email address (must be unique)
 * - password: User's chosen password
 * - confirm_password: Password confirmation (must match)
 * - first_name: User's first name
 * - last_name: User's last name
 *
 * Validation:
 * - Passwords must match
 * - Password must be at least 6 characters
 * - Email must be unique (enforced by database constraint)
 *
 * Note: All new signups get 'common' role by default
 * Manager role must be assigned by existing manager
 */
router.post('/signup', isNotAuthenticated, async (req, res) => {
  const { email, password, confirm_password, first_name, last_name } = req.body;

  // Validate that passwords match
  if (password !== confirm_password) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/auth/signup');
  }

  // Validate minimum password length
  if (password.length < 6) {
    req.flash('error', 'Password must be at least 6 characters');
    return res.redirect('/auth/signup');
  }

  try {
    // Hash the password using bcrypt
    // Salt rounds of 10 provides good security/performance balance
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    // RETURNING clause gives us the new user data without a separate query
    const result = await pool.query(
      `INSERT INTO app_user (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, 'common')
       RETURNING user_id, email, first_name, last_name, role`,
      [email, password_hash, first_name, last_name]
    );

    const newUser = result.rows[0];

    // Auto-login the newly registered user
    req.session.user = {
      id: newUser.user_id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.role,
    };

    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error('Signup error:', err);

    // Handle duplicate email error (PostgreSQL error code 23505)
    if (err.code === '23505') {
      req.flash('error', 'An account with this email already exists');
    } else {
      req.flash('error', 'An error occurred during signup');
    }
    res.redirect('/auth/signup');
  }
});

// =============================================================================
// LOGOUT ROUTES
// =============================================================================

/**
 * POST /auth/logout
 * Logs out the current user by destroying their session
 * POST method is preferred for logout as it modifies server state
 */
router.post('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

/**
 * GET /auth/logout
 * Alternative logout route for convenience
 * Allows logout via direct URL navigation
 */
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

export default router;
