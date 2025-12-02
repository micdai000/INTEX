import express from 'express';
import db from '../config/database.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Home page
router.get('/', async (req, res) => {
  try {
    let query = `SELECT l.*, u.username 
       FROM listings l 
       LEFT JOIN users u ON l.user_id = u.user_id 
       WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    // Apply filters
    if (req.query.university) {
      query += ` AND l.university_proximity = $${paramCount}`;
      params.push(req.query.university);
      paramCount++;
    }

    if (req.query.gender) {
      query += ` AND l.gender = $${paramCount}`;
      params.push(req.query.gender);
      paramCount++;
    }

    if (req.query.maxPrice) {
      query += ` AND l.rent_price <= $${paramCount}`;
      params.push(parseInt(req.query.maxPrice));
      paramCount++;
    }

    query += ` ORDER BY l.created_at DESC LIMIT 12`;

    const result = await db.query(query, params);

    // Get amenities for each listing
    for (let listing of result.rows) {
      const amenitiesResult = await db.query(
        'SELECT a.name FROM amenities a JOIN listing_amenities la ON a.amenity_id = la.amenity_id WHERE la.listing_id = $1',
        [listing.listing_id]
      );
      listing.amenities = amenitiesResult.rows.map(row => row.name);
    }

    res.render('index', {
      title: 'Provo Student Housing Swap',
      listings: result.rows,
      query: req.query,
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load page',
      user: req.session.user || null,
    });
  }
});

// Dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.user.user_id]
    );

    res.render('dashboard', {
      title: 'My Dashboard',
      listings: result.rows,
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load dashboard',
      user: req.session.user || null,
    });
  }
});

export default router;

