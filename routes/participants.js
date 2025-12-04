/**
 * ============================================================================
 * PARTICIPANTS ROUTES
 * ============================================================================
 *
 * CRUD operations for managing participants (people who attend events).
 *
 * Routes:
 * - GET  /participants         - List all participants with search
 * - GET  /participants/:id     - View single participant with milestones
 * - GET  /participants/create/new - Create form (managers only)
 * - POST /participants         - Create new participant (managers only)
 * - GET  /participants/:id/edit - Edit form (managers only)
 * - POST /participants/:id     - Update participant (managers only)
 * - POST /participants/:id/delete - Delete participant (managers only)
 * - POST /participants/:id/milestones - Add milestone (managers only)
 * - POST /participants/:id/milestones/:no/delete - Delete milestone (managers only)
 *
 * Database Tables:
 * - person: Main participant data
 * - milestone: Achievements linked to participants (1-to-many)
 * - registration: Event registrations (deleted on participant delete)
 * - donation: Donations made by participant (deleted on participant delete)
 *
 * ============================================================================
 */

import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated, isManager } from '../middleware/auth.js';

const router = express.Router();

// =============================================================================
// LIST & SEARCH
// =============================================================================

/**
 * GET /participants
 * Lists all participants with optional fuzzy search
 *
 * Query Parameters:
 * - search: Optional search term (searches across all text fields)
 *
 * Search Features:
 * - Multi-word search: "john smith" finds records containing both words
 * - Case-insensitive matching
 * - Searches: name, email, phone, location, school, field of interest
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { search } = req.query;

    // Base query - only get participants (not staff)
    let query = `
      SELECT person_id, email, first_name, last_name, role, phone, city, state,
             school_or_employer, field_of_interest
      FROM person
      WHERE role = 'participant'
    `;
    const params = [];

    // Apply search filter if provided
    if (search) {
      const searchTerm = search.trim().toLowerCase();

      // Split search into words for multi-word fuzzy matching
      const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

      if (words.length > 0) {
        // Create a searchable text field combining all columns
        // COALESCE handles NULL values by converting them to empty strings
        const searchableText = `
          LOWER(COALESCE(first_name, '') || ' ' ||
                COALESCE(last_name, '') || ' ' ||
                COALESCE(email, '') || ' ' ||
                COALESCE(phone, '') || ' ' ||
                COALESCE(city, '') || ' ' ||
                COALESCE(state, '') || ' ' ||
                COALESCE(school_or_employer, '') || ' ' ||
                COALESCE(field_of_interest, '') || ' ' ||
                CAST(person_id AS TEXT))
        `;

        // Each word must be found somewhere in the searchable text
        // Using parameterized queries to prevent SQL injection
        const wordConditions = words.map((word, index) => {
          params.push(`%${word}%`);
          return `${searchableText} LIKE $${index + 1}`;
        });

        query += ` AND (${wordConditions.join(' AND ')})`;
      }
    }

    // Sort alphabetically by last name, then first name
    query += ' ORDER BY last_name, first_name';

    const result = await pool.query(query, params);

    res.render('participants/index', {
      title: 'Participants - Ella Rises',
      participants: result.rows,
      search: search || '',
    });
  } catch (err) {
    console.error('Error fetching participants:', err);
    req.flash('error', 'Error loading participants');
    res.redirect('/dashboard');
  }
});

// =============================================================================
// VIEW SINGLE PARTICIPANT
// =============================================================================

/**
 * GET /participants/:id
 * Displays a single participant's details with their milestones
 *
 * URL Parameters:
 * - id: The person_id of the participant
 *
 * Displays:
 * - Personal information (name, email, phone, location)
 * - School/employer and field of interest
 * - List of achieved milestones
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Get participant details
    const participantResult = await pool.query(
      'SELECT * FROM person WHERE person_id = $1',
      [id]
    );

    // Handle participant not found
    if (participantResult.rows.length === 0) {
      req.flash('error', 'Participant not found');
      return res.redirect('/participants');
    }

    // Get participant's milestones, sorted by date (newest first)
    const milestonesResult = await pool.query(
      'SELECT * FROM milestone WHERE person_id = $1 ORDER BY milestone_date DESC',
      [id]
    );

    res.render('participants/show', {
      title: 'Participant Details - Ella Rises',
      participant: participantResult.rows[0],
      milestones: milestonesResult.rows,
    });
  } catch (err) {
    console.error('Error fetching participant:', err);
    req.flash('error', 'Error loading participant');
    res.redirect('/participants');
  }
});

// =============================================================================
// CREATE PARTICIPANT
// =============================================================================

/**
 * GET /participants/create/new
 * Displays the form to create a new participant
 * Restricted to managers only
 */
router.get('/create/new', isManager, (req, res) => {
  res.render('participants/create', {
    title: 'Add Participant - Ella Rises',
  });
});

/**
 * POST /participants
 * Creates a new participant record
 * Restricted to managers only
 *
 * Request Body:
 * - email: Email address
 * - first_name, last_name: Full name
 * - dob: Date of birth (optional)
 * - phone: Phone number (optional)
 * - city, state, zip: Location (optional)
 * - school_or_employer: Current school or workplace
 * - field_of_interest: STEAM field of interest
 */
router.post('/', isManager, async (req, res) => {
  try {
    const {
      email, first_name, last_name, dob, phone, city, state, zip,
      school_or_employer, field_of_interest
    } = req.body;

    // Insert new participant with role = 'participant'
    await pool.query(
      `INSERT INTO person (email, first_name, last_name, dob, role, phone, city, state, zip, school_or_employer, field_of_interest)
       VALUES ($1, $2, $3, $4, 'participant', $5, $6, $7, $8, $9, $10)`,
      [email, first_name, last_name, dob || null, phone, city, state, zip, school_or_employer, field_of_interest]
    );

    req.flash('success', 'Participant added successfully');
    res.redirect('/participants');
  } catch (err) {
    console.error('Error creating participant:', err);
    req.flash('error', 'Error adding participant');
    res.redirect('/participants/create/new');
  }
});

// =============================================================================
// UPDATE PARTICIPANT
// =============================================================================

/**
 * GET /participants/:id/edit
 * Displays the edit form for an existing participant
 * Restricted to managers only
 */
router.get('/:id/edit', isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM person WHERE person_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'Participant not found');
      return res.redirect('/participants');
    }

    res.render('participants/edit', {
      title: 'Edit Participant - Ella Rises',
      participant: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching participant:', err);
    req.flash('error', 'Error loading participant');
    res.redirect('/participants');
  }
});

/**
 * POST /participants/:id
 * Updates an existing participant record
 * Restricted to managers only
 */
router.post('/:id', isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email, first_name, last_name, dob, phone, city, state, zip,
      school_or_employer, field_of_interest
    } = req.body;

    await pool.query(
      `UPDATE person SET
        email = $1, first_name = $2, last_name = $3, dob = $4,
        phone = $5, city = $6, state = $7, zip = $8,
        school_or_employer = $9, field_of_interest = $10
       WHERE person_id = $11`,
      [email, first_name, last_name, dob || null, phone, city, state, zip, school_or_employer, field_of_interest, id]
    );

    req.flash('success', 'Participant updated successfully');
    res.redirect(`/participants/${id}`);
  } catch (err) {
    console.error('Error updating participant:', err);
    req.flash('error', 'Error updating participant');
    res.redirect(`/participants/${id}/edit`);
  }
});

// =============================================================================
// MILESTONE MANAGEMENT
// =============================================================================

/**
 * POST /participants/:id/milestones
 * Adds a new milestone to a participant
 * Restricted to managers only
 *
 * Request Body:
 * - milestone_title: Name/description of the milestone
 * - milestone_date: Date achieved (optional)
 *
 * Note: milestone_no is auto-generated as the next sequential number
 */
router.post('/:id/milestones', isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { milestone_title, milestone_date } = req.body;

    // Get the next milestone_no for this person
    // Uses COALESCE to handle case where person has no milestones yet
    const maxResult = await pool.query(
      'SELECT COALESCE(MAX(milestone_no), 0) + 1 as next_no FROM milestone WHERE person_id = $1',
      [id]
    );
    const nextNo = maxResult.rows[0].next_no;

    await pool.query(
      `INSERT INTO milestone (person_id, milestone_no, milestone_title, milestone_date)
       VALUES ($1, $2, $3, $4)`,
      [id, nextNo, milestone_title, milestone_date || null]
    );

    req.flash('success', 'Milestone added successfully');
    res.redirect(`/participants/${id}`);
  } catch (err) {
    console.error('Error adding milestone:', err);
    req.flash('error', 'Error adding milestone');
    res.redirect(`/participants/${req.params.id}`);
  }
});

/**
 * POST /participants/:id/milestones/:milestoneNo/delete
 * Deletes a milestone from a participant
 * Restricted to managers only
 */
router.post('/:id/milestones/:milestoneNo/delete', isManager, async (req, res) => {
  try {
    const { id, milestoneNo } = req.params;

    await pool.query(
      'DELETE FROM milestone WHERE person_id = $1 AND milestone_no = $2',
      [id, milestoneNo]
    );

    req.flash('success', 'Milestone deleted successfully');
    res.redirect(`/participants/${id}`);
  } catch (err) {
    console.error('Error deleting milestone:', err);
    req.flash('error', 'Error deleting milestone');
    res.redirect(`/participants/${req.params.id}`);
  }
});

// =============================================================================
// DELETE PARTICIPANT
// =============================================================================

/**
 * POST /participants/:id/delete
 * Deletes a participant and all related records
 * Restricted to managers only
 *
 * Cascade Delete Order:
 * 1. Milestones (achievements)
 * 2. Registrations (event sign-ups)
 * 3. Donations (financial contributions)
 * 4. Person record
 */
router.post('/:id/delete', isManager, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related records first to maintain referential integrity
    await pool.query('DELETE FROM milestone WHERE person_id = $1', [id]);
    await pool.query('DELETE FROM registration WHERE person_id = $1', [id]);
    await pool.query('DELETE FROM donation WHERE person_id = $1', [id]);
    await pool.query('DELETE FROM person WHERE person_id = $1', [id]);

    req.flash('success', 'Participant deleted successfully');
    res.redirect('/participants');
  } catch (err) {
    console.error('Error deleting participant:', err);
    req.flash('error', 'Error deleting participant');
    res.redirect('/participants');
  }
});

export default router;
