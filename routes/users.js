/**
 * ============================================================================
 * USERS ROUTES (Manager Only)
 * ============================================================================
 *
 * CRUD operations for managing application user accounts.
 * All routes require manager authentication.
 *
 * User Roles:
 * - 'manager': Full CRUD access to all data and user management
 * - 'common': Read-only access (can view but not modify data)
 *
 * Security Features:
 * - Passwords hashed with bcrypt (salt rounds: 10)
 * - Prevents self-deletion (managers can't delete their own account)
 * - Email uniqueness enforced by database constraint
 *
 * Routes:
 * - GET  /users              - List all users
 * - GET  /users/create/new   - Create user form
 * - POST /users              - Create user
 * - GET  /users/:id/edit     - Edit user form
 * - POST /users/:id          - Update user
 * - POST /users/:id/delete   - Delete user
 *
 * ============================================================================
 */

import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { isManager } from '../middleware/auth.js';

const router = express.Router();

// Apply isManager middleware to ALL routes in this file
router.use(isManager);

// =============================================================================
// LIST USERS
// =============================================================================

// List all users with search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT user_id, email, first_name, last_name, role, created_at
      FROM app_user
    `;
    const params = [];

    if (search) {
      const searchTerm = search.trim().toLowerCase();
      const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

      if (words.length > 0) {
        const searchableText = `
          LOWER(COALESCE(first_name, '') || ' ' ||
                COALESCE(last_name, '') || ' ' ||
                COALESCE(email, '') || ' ' ||
                COALESCE(role, '') || ' ' ||
                CAST(user_id AS TEXT))
        `;

        const wordConditions = words.map((word, index) => {
          params.push(`%${word}%`);
          return `${searchableText} LIKE $${index + 1}`;
        });

        query += ` WHERE (${wordConditions.join(' AND ')})`;
      }
    }

    query += ' ORDER BY last_name, first_name';

    const result = await pool.query(query, params);

    res.render('users/index', {
      title: 'User Management - Ella Rises',
      users: result.rows,
      search: search || '',
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    req.flash('error', 'Error loading users');
    res.redirect('/dashboard');
  }
});

// Create user form
router.get('/create/new', (req, res) => {
  res.render('users/create', {
    title: 'Add User - Ella Rises',
  });
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    await pool.query(
      `INSERT INTO app_user (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, password_hash, first_name, last_name, role || 'common']
    );

    req.flash('success', 'User created successfully');
    res.redirect('/users');
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.code === '23505') {
      req.flash('error', 'Email already exists');
    } else {
      req.flash('error', 'Error creating user');
    }
    res.redirect('/users/create/new');
  }
});

// Edit user form
router.get('/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT user_id, email, first_name, last_name, role FROM app_user WHERE user_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'User not found');
      return res.redirect('/users');
    }

    res.render('users/edit', {
      title: 'Edit User - Ella Rises',
      editUser: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    req.flash('error', 'Error loading user');
    res.redirect('/users');
  }
});

// Update user
router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, first_name, last_name, role } = req.body;

    // If password provided, update with new hash
    if (password && password.trim()) {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      await pool.query(
        `UPDATE app_user SET
          email = $1, password_hash = $2, first_name = $3, last_name = $4, role = $5
         WHERE user_id = $6`,
        [email, password_hash, first_name, last_name, role, id]
      );
    } else {
      // Update without changing password
      await pool.query(
        `UPDATE app_user SET
          email = $1, first_name = $2, last_name = $3, role = $4
         WHERE user_id = $5`,
        [email, first_name, last_name, role, id]
      );
    }

    req.flash('success', 'User updated successfully');
    res.redirect('/users');
  } catch (err) {
    console.error('Error updating user:', err);
    if (err.code === '23505') {
      req.flash('error', 'Email already exists');
    } else {
      req.flash('error', 'Error updating user');
    }
    res.redirect(`/users/${req.params.id}/edit`);
  }
});

// Delete user
router.post('/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.session.user.id) {
      req.flash('error', 'Cannot delete your own account');
      return res.redirect('/users');
    }

    await pool.query('DELETE FROM app_user WHERE user_id = $1', [id]);

    req.flash('success', 'User deleted successfully');
    res.redirect('/users');
  } catch (err) {
    console.error('Error deleting user:', err);
    req.flash('error', 'Error deleting user');
    res.redirect('/users');
  }
});

export default router;
