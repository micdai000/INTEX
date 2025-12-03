// Events Routes - CRUD operations for events
import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated, isManager } from '../middleware/auth.js';

const router = express.Router();

// List all events with search
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT e.*,
        (SELECT COUNT(*) FROM event_occurrence WHERE event_id = e.event_id) as occurrence_count
      FROM event e
    `;
    const params = [];

    if (search) {
      const searchTerm = search.trim().toLowerCase();
      const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

      if (words.length > 0) {
        const searchableText = `
          LOWER(COALESCE(event_name, '') || ' ' ||
                COALESCE(event_type, '') || ' ' ||
                COALESCE(event_description, '') || ' ' ||
                COALESCE(event_recurrence_pattern, '') || ' ' ||
                CAST(e.event_id AS TEXT))
        `;

        const wordConditions = words.map((word, index) => {
          params.push(`%${word}%`);
          return `${searchableText} LIKE $${index + 1}`;
        });

        query += ` WHERE (${wordConditions.join(' AND ')})`;
      }
    }

    query += ' ORDER BY event_name';

    const result = await pool.query(query, params);

    res.render('events/index', {
      title: 'Events - Ella Rises',
      events: result.rows,
      search: search || '',
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    req.flash('error', 'Error loading events');
    res.redirect('/dashboard');
  }
});

// Show single event with occurrences
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const eventResult = await pool.query(
      'SELECT * FROM event WHERE event_id = $1',
      [id]
    );

    if (eventResult.rows.length === 0) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    const occurrencesResult = await pool.query(
      `SELECT eo.*,
        (SELECT COUNT(*) FROM registration WHERE event_occurrence_id = eo.event_occurrence_id) as registration_count
       FROM event_occurrence eo
       WHERE eo.event_id = $1
       ORDER BY eo.event_datetime_start DESC`,
      [id]
    );

    res.render('events/show', {
      title: 'Event Details - Ella Rises',
      event: eventResult.rows[0],
      occurrences: occurrencesResult.rows,
    });
  } catch (err) {
    console.error('Error fetching event:', err);
    req.flash('error', 'Error loading event');
    res.redirect('/events');
  }
});

// Create event form
router.get('/create/new', isManager, (req, res) => {
  res.render('events/create', {
    title: 'Add Event - Ella Rises',
  });
});

// Create event
router.post('/', isManager, async (req, res) => {
  try {
    const { event_name, event_type, event_description, event_recurrence_pattern, event_default_capacity } = req.body;

    await pool.query(
      `INSERT INTO event (event_name, event_type, event_description, event_recurrence_pattern, event_default_capacity)
       VALUES ($1, $2, $3, $4, $5)`,
      [event_name, event_type, event_description, event_recurrence_pattern, event_default_capacity || null]
    );

    req.flash('success', 'Event created successfully');
    res.redirect('/events');
  } catch (err) {
    console.error('Error creating event:', err);
    req.flash('error', 'Error creating event');
    res.redirect('/events/create/new');
  }
});

// Edit event form
router.get('/:id/edit', isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM event WHERE event_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }

    res.render('events/edit', {
      title: 'Edit Event - Ella Rises',
      event: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching event:', err);
    req.flash('error', 'Error loading event');
    res.redirect('/events');
  }
});

// Update event
router.post('/:id', isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { event_name, event_type, event_description, event_recurrence_pattern, event_default_capacity } = req.body;

    await pool.query(
      `UPDATE event SET
        event_name = $1, event_type = $2, event_description = $3,
        event_recurrence_pattern = $4, event_default_capacity = $5
       WHERE event_id = $6`,
      [event_name, event_type, event_description, event_recurrence_pattern, event_default_capacity || null, id]
    );

    req.flash('success', 'Event updated successfully');
    res.redirect(`/events/${id}`);
  } catch (err) {
    console.error('Error updating event:', err);
    req.flash('error', 'Error updating event');
    res.redirect(`/events/${id}/edit`);
  }
});

// Delete event
router.post('/:id/delete', isManager, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related records first
    await pool.query(
      'DELETE FROM registration WHERE event_occurrence_id IN (SELECT event_occurrence_id FROM event_occurrence WHERE event_id = $1)',
      [id]
    );
    await pool.query('DELETE FROM event_occurrence WHERE event_id = $1', [id]);
    await pool.query('DELETE FROM event WHERE event_id = $1', [id]);

    req.flash('success', 'Event deleted successfully');
    res.redirect('/events');
  } catch (err) {
    console.error('Error deleting event:', err);
    req.flash('error', 'Error deleting event');
    res.redirect('/events');
  }
});

export default router;
