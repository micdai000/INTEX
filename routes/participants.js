// Participants Routes - CRUD operations for participants
import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated, isManager } from '../middleware/auth.js';

const router = express.Router();

// List all participants with search
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT person_id, email, first_name, last_name, role, phone, city, state,
             school_or_employer, field_of_interest
      FROM person
      WHERE role = 'participant'
    `;
    const params = [];

    if (search) {
      const searchTerm = search.trim().toLowerCase();

      // Split search into words for multi-word fuzzy matching
      const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

      if (words.length > 0) {
        // Create a searchable text field combining all columns
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
        const wordConditions = words.map((word, index) => {
          params.push(`%${word}%`);
          return `${searchableText} LIKE $${index + 1}`;
        });

        query += ` AND (${wordConditions.join(' AND ')})`;
      }
    }

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

// Show single participant with milestones
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Get participant details
    const participantResult = await pool.query(
      'SELECT * FROM person WHERE person_id = $1',
      [id]
    );

    if (participantResult.rows.length === 0) {
      req.flash('error', 'Participant not found');
      return res.redirect('/participants');
    }

    // Get participant milestones
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

// Create participant form
router.get('/create/new', isManager, (req, res) => {
  res.render('participants/create', {
    title: 'Add Participant - Ella Rises',
  });
});

// Create participant
router.post('/', isManager, async (req, res) => {
  try {
    const {
      email, first_name, last_name, dob, phone, city, state, zip,
      school_or_employer, field_of_interest
    } = req.body;

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

// Edit participant form
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

// Update participant
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

// Add milestone to participant
router.post('/:id/milestones', isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { milestone_title, milestone_date } = req.body;

    // Get the next milestone_no for this person
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

// Delete milestone from participant
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

// Delete participant
router.post('/:id/delete', isManager, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related records first
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
