/**
 * ============================================================================
 * MILESTONES ROUTES
 * ============================================================================
 *
 * CRUD operations for participant milestone tracking.
 * Milestones represent achievements like graduation, job placement, etc.
 *
 * Key Metrics (from requirements):
 * - STEAM field major post-secondary graduation rate
 * - STEAM field post-college job rate
 *
 * Database Structure:
 * - milestone: Tracks participant achievements
 * - Composite key: person_id + milestone_no
 * - milestone_no auto-increments per person
 *
 * Routes:
 * - GET  /milestones                    - List all milestones
 * - GET  /milestones/create/new         - Create form
 * - POST /milestones                    - Create milestone
 * - GET  /milestones/:pid/:no/edit      - Edit form
 * - POST /milestones/:pid/:no           - Update milestone
 * - POST /milestones/:pid/:no/delete    - Delete milestone
 *
 * ============================================================================
 */

import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated, isManager } from '../middleware/auth.js';

const router = express.Router();

// =============================================================================
// LIST & SEARCH MILESTONES
// =============================================================================

/**
 * GET /milestones
 * Lists all milestones with participant information
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT m.*, p.first_name, p.last_name, p.email
      FROM milestone m
      JOIN person p ON m.person_id = p.person_id
    `;
    const params = [];

    if (search) {
      const searchTerm = search.trim().toLowerCase();
      const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

      if (words.length > 0) {
        const searchableText = `
          LOWER(COALESCE(p.first_name, '') || ' ' ||
                COALESCE(p.last_name, '') || ' ' ||
                COALESCE(p.email, '') || ' ' ||
                COALESCE(m.milestone_title, '') || ' ' ||
                CAST(m.person_id AS TEXT))
        `;

        const wordConditions = words.map((word, index) => {
          params.push(`%${word}%`);
          return `${searchableText} LIKE $${index + 1}`;
        });

        query += ` WHERE (${wordConditions.join(' AND ')})`;
      }
    }

    query += ' ORDER BY m.milestone_date DESC, p.last_name';

    const result = await pool.query(query, params);

    res.render('milestones/index', {
      title: 'Milestones - Ella Rises',
      milestones: result.rows,
      search: search || '',
    });
  } catch (err) {
    console.error('Error fetching milestones:', err);
    req.flash('error', 'Error loading milestones');
    res.redirect('/dashboard');
  }
});

// Create milestone form
router.get('/create/new', isManager, async (req, res) => {
  try {
    const participants = await pool.query(
      `SELECT person_id, first_name, last_name, email
       FROM person
       WHERE role = 'participant'
       ORDER BY last_name, first_name`
    );

    res.render('milestones/create', {
      title: 'Add Milestone - Ella Rises',
      participants: participants.rows,
      preselectedPersonId: req.query.person_id || null,
    });
  } catch (err) {
    console.error('Error loading create form:', err);
    req.flash('error', 'Error loading form');
    res.redirect('/milestones');
  }
});

// Create milestone
router.post('/', isManager, async (req, res) => {
  try {
    const { person_id, milestone_title, milestone_date } = req.body;

    // Get the next milestone number for this person
    const maxResult = await pool.query(
      'SELECT COALESCE(MAX(milestone_no), 0) + 1 as next_no FROM milestone WHERE person_id = $1',
      [person_id]
    );
    const milestone_no = maxResult.rows[0].next_no;

    await pool.query(
      `INSERT INTO milestone (person_id, milestone_no, milestone_title, milestone_date)
       VALUES ($1, $2, $3, $4)`,
      [person_id, milestone_no, milestone_title, milestone_date || null]
    );

    req.flash('success', 'Milestone added successfully');

    // Redirect back to participant if came from there
    if (req.body.return_to_participant) {
      res.redirect(`/participants/${person_id}`);
    } else {
      res.redirect('/milestones');
    }
  } catch (err) {
    console.error('Error creating milestone:', err);
    req.flash('error', 'Error adding milestone');
    res.redirect('/milestones/create/new');
  }
});

// Edit milestone form
router.get('/:personId/:milestoneNo/edit', isManager, async (req, res) => {
  try {
    const { personId, milestoneNo } = req.params;

    const result = await pool.query(
      `SELECT m.*, p.first_name, p.last_name
       FROM milestone m
       JOIN person p ON m.person_id = p.person_id
       WHERE m.person_id = $1 AND m.milestone_no = $2`,
      [personId, milestoneNo]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'Milestone not found');
      return res.redirect('/milestones');
    }

    res.render('milestones/edit', {
      title: 'Edit Milestone - Ella Rises',
      milestone: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching milestone:', err);
    req.flash('error', 'Error loading milestone');
    res.redirect('/milestones');
  }
});

// Update milestone
router.post('/:personId/:milestoneNo', isManager, async (req, res) => {
  try {
    const { personId, milestoneNo } = req.params;
    const { milestone_title, milestone_date } = req.body;

    await pool.query(
      `UPDATE milestone SET milestone_title = $1, milestone_date = $2
       WHERE person_id = $3 AND milestone_no = $4`,
      [milestone_title, milestone_date || null, personId, milestoneNo]
    );

    req.flash('success', 'Milestone updated successfully');
    res.redirect('/milestones');
  } catch (err) {
    console.error('Error updating milestone:', err);
    req.flash('error', 'Error updating milestone');
    res.redirect(`/milestones/${req.params.personId}/${req.params.milestoneNo}/edit`);
  }
});

// Delete milestone
router.post('/:personId/:milestoneNo/delete', isManager, async (req, res) => {
  try {
    const { personId, milestoneNo } = req.params;

    await pool.query(
      'DELETE FROM milestone WHERE person_id = $1 AND milestone_no = $2',
      [personId, milestoneNo]
    );

    req.flash('success', 'Milestone deleted successfully');

    // Redirect back to participant if requested
    if (req.body.return_to_participant) {
      res.redirect(`/participants/${personId}`);
    } else {
      res.redirect('/milestones');
    }
  } catch (err) {
    console.error('Error deleting milestone:', err);
    req.flash('error', 'Error deleting milestone');
    res.redirect('/milestones');
  }
});

export default router;
