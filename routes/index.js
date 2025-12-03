// Index Routes - Landing page and dashboard
import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Landing page - public
router.get('/', async (req, res) => {
  try {
    // Get next upcoming event
    // Use CURRENT_TIMESTAMP for timezone-aware comparison
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
    console.error('Error fetching next event:', err.message);
    console.error('Full error:', err);
    res.render('index', {
      title: 'Ella Rises - Empowering Women in STEAM',
      nextEvent: null
    });
  }
});

// Dashboard - requires authentication
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Query counts from database
    const [participantsResult, eventsResult, registrationsResult, donationsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM person'),
      pool.query('SELECT COUNT(*) FROM event'),
      pool.query('SELECT COUNT(*) FROM registration'),
      pool.query('SELECT COUNT(*) FROM donation')
    ]);

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
    // Render with zeros if queries fail
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

// About page - public
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About - Ella Rises',
  });
});

// Debug route to check event data (remove in production if needed)
router.get('/debug/events', async (req, res) => {
  try {
    // Get database time
    const timeResult = await pool.query('SELECT NOW() as db_time, CURRENT_TIMESTAMP as current_ts');

    // Get all event occurrences
    const eventsResult = await pool.query(`
      SELECT e.event_name, eo.event_datetime_start, eo.event_location,
             eo.event_datetime_start > CURRENT_TIMESTAMP as is_future
      FROM event_occurrence eo
      JOIN event e ON e.event_id = eo.event_id
      ORDER BY eo.event_datetime_start DESC
      LIMIT 10
    `);

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
