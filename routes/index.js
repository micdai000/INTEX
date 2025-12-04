/**
 * ============================================================================
 * INDEX ROUTES
 * ============================================================================
 *
 * Handles the main public and authenticated pages:
 * - Landing page (public)
 * - Dashboard (authenticated users)
 * - About page (public)
 *
 * The dashboard aggregates statistics from the database and displays
 * an embedded Tableau visualization for data analytics.
 *
 * ============================================================================
 */

import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// =============================================================================
// PUBLIC PAGES
// =============================================================================

/**
 * GET /
 * Landing page - the main public-facing page
 *
 * Features:
 * - Hero section with mission statement
 * - Event countdown for the next upcoming event
 * - Information about Ella Rises programs
 * - Call-to-action for donations and involvement
 *
 * Database Query:
 * Fetches the next upcoming event occurrence to display a countdown timer
 */
router.get('/', async (req, res) => {
  try {
    // Query for the next upcoming event
    // Uses CURRENT_TIMESTAMP for timezone-aware comparison
    const nextEventResult = await pool.query(`
      SELECT e.event_name, e.event_type, eo.event_datetime_start, eo.event_location
      FROM event_occurrence eo
      JOIN event e ON e.event_id = eo.event_id
      WHERE eo.event_datetime_start > CURRENT_TIMESTAMP
      ORDER BY eo.event_datetime_start ASC
      LIMIT 1
    `);

    const nextEvent = nextEventResult.rows[0] || null;

    // Debug logging for production troubleshooting
    if (process.env.NODE_ENV === 'production') {
      console.log('Next event query result:', nextEvent ? nextEvent.event_name : 'No upcoming events found');
    }

    res.render('index', {
      title: 'Ella Rises - Empowering Women in STEAM',
      nextEvent: nextEvent
    });
  } catch (err) {
    // Log error but still render page without event data
    console.error('Error fetching next event:', err.message);
    console.error('Full error:', err);

    res.render('index', {
      title: 'Ella Rises - Empowering Women in STEAM',
      nextEvent: null
    });
  }
});

/**
 * GET /about
 * About page - information about Ella Rises organization
 * Displays mission, team, and organizational information
 */
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About - Ella Rises',
  });
});

// =============================================================================
// AUTHENTICATED PAGES
// =============================================================================

/**
 * GET /dashboard
 * Main dashboard for authenticated users
 *
 * Features:
 * - Statistics cards showing counts of participants, events, registrations, donations
 * - Embedded Tableau dashboard for data visualization
 * - Quick navigation to data management sections
 *
 * Database Queries:
 * Aggregates counts from multiple tables using parallel queries for performance
 */
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Execute count queries in parallel for better performance
    const [participantsResult, eventsResult, registrationsResult, donationsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM person'),
      pool.query('SELECT COUNT(*) FROM event'),
      pool.query('SELECT COUNT(*) FROM registration'),
      pool.query('SELECT COUNT(*) FROM donation')
    ]);

    // Render dashboard with aggregated statistics
    res.render('dashboard', {
      title: 'Dashboard - Ella Rises',
      stats: {
        participants: participantsResult.rows[0].count,
        events: eventsResult.rows[0].count,
        registrations: registrationsResult.rows[0].count,
        donations: donationsResult.rows[0].count
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);

    // Render dashboard with zero counts if database queries fail
    // This ensures the page still loads even with database issues
    res.render('dashboard', {
      title: 'Dashboard - Ella Rises',
      stats: {
        participants: 0,
        events: 0,
        registrations: 0,
        donations: 0
      }
    });
  }
});

// =============================================================================
// DEBUG ROUTES (Development Only)
// =============================================================================

/**
 * GET /debug/events
 * Debug endpoint for troubleshooting event data
 * Returns JSON with database time and recent events
 *
 * Note: Consider removing or protecting this route in production
 */
router.get('/debug/events', async (req, res) => {
  try {
    // Get current database time for timezone debugging
    const timeResult = await pool.query('SELECT NOW() as db_time, CURRENT_TIMESTAMP as current_ts');

    // Get recent event occurrences with future/past indicator
    const eventsResult = await pool.query(`
      SELECT e.event_name, eo.event_datetime_start, eo.event_location,
             eo.event_datetime_start > CURRENT_TIMESTAMP as is_future
      FROM event_occurrence eo
      JOIN event e ON e.event_id = eo.event_id
      ORDER BY eo.event_datetime_start DESC
      LIMIT 10
    `);

    // Return debug information as JSON
    res.json({
      server_time: new Date().toISOString(),
      database_time: timeResult.rows[0],
      events: eventsResult.rows,
      event_count: eventsResult.rows.length
    });
  } catch (err) {
    res.json({ error: err.message, stack: err.stack });
  }
});

export default router;
