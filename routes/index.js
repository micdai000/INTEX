// Index Routes - Landing page and dashboard
import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Landing page - public
router.get('/', async (req, res) => {
  try {
    // Get next upcoming event
    const nextEventResult = await pool.query(`
      SELECT e.event_name, e.event_type, eo.event_datetime_start, eo.event_location
      FROM event_occurrence eo
      JOIN event e ON e.event_id = eo.event_id
      WHERE eo.event_datetime_start > NOW()
      ORDER BY eo.event_datetime_start ASC
      LIMIT 1
    `);

    const nextEvent = nextEventResult.rows[0] || null;

    res.render('index', {
      title: 'Ella Rises - Empowering Women in STEAM',
      nextEvent: nextEvent
    });
  } catch (err) {
    console.error('Error fetching next event:', err);
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

export default router;
