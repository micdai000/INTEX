import express from 'express';
import db from '../config/database.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get all listings (with optional filters) - API endpoint
router.get('/api', async (req, res) => {
  try {
    let query = 'SELECT l.*, u.username FROM listings l LEFT JOIN users u ON l.user_id = u.user_id WHERE 1=1';
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

    if (req.query.minPrice) {
      query += ` AND l.rent_price >= $${paramCount}`;
      params.push(parseInt(req.query.minPrice));
      paramCount++;
    }

    if (req.query.maxPrice) {
      query += ` AND l.rent_price <= $${paramCount}`;
      params.push(parseInt(req.query.maxPrice));
      paramCount++;
    }

    if (req.query.privateRoom === 'true') {
      query += ` AND l.is_private_room = true`;
    }

    query += ' ORDER BY l.created_at DESC';

    const result = await db.query(query, params);

    // Get amenities for each listing
    for (let listing of result.rows) {
      const amenitiesResult = await db.query(
        'SELECT a.name FROM amenities a JOIN listing_amenities la ON a.amenity_id = la.amenity_id WHERE la.listing_id = $1',
        [listing.listing_id]
      );
      listing.amenities = amenitiesResult.rows.map(row => row.name);
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Create listing page - MUST be before /:id route
router.get('/create/new', isAuthenticated, async (req, res) => {
  try {
    // Get all amenities
    const amenitiesResult = await db.query('SELECT * FROM amenities ORDER BY name');
    
    res.render('listings/create', {
      title: 'Create Listing',
      amenities: amenitiesResult.rows,
    });
  } catch (error) {
    console.error('Error loading create page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load page',
      user: req.session.user || null,
    });
  }
});

// Create listing POST
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      rent_price,
      gender,
      university_proximity,
      is_private_room,
      contract_term,
      image_url_1,
      image_url_2,
      image_url_3,
      amenities,
    } = req.body;

    // Insert listing
    const listingResult = await db.query(
      `INSERT INTO listings (
        user_id, title, description, rent_price, gender, 
        university_proximity, is_private_room, contract_term,
        image_url_1, image_url_2, image_url_3
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING listing_id`,
      [
        req.session.user.user_id,
        title,
        description,
        parseInt(rent_price),
        gender,
        university_proximity,
        is_private_room === 'on' || is_private_room === true,
        contract_term,
        image_url_1 || null,
        image_url_2 || null,
        image_url_3 || null,
      ]
    );

    const listingId = listingResult.rows[0].listing_id;

    // Insert amenities
    if (amenities && Array.isArray(amenities)) {
      for (const amenityName of amenities) {
        // Get amenity ID
        const amenityResult = await db.query(
          'SELECT amenity_id FROM amenities WHERE name = $1',
          [amenityName]
        );

        if (amenityResult.rows.length > 0) {
          await db.query(
            'INSERT INTO listing_amenities (listing_id, amenity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [listingId, amenityResult.rows[0].amenity_id]
          );
        }
      }
    }

    res.redirect(`/listings/${listingId}`);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to create listing',
      user: req.session.user || null,
    });
  }
});

// Get user's listings - API endpoint
router.get('/my/listings', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.user.user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing - MUST be last to avoid route conflicts
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT l.*, u.username, u.email FROM listings l LEFT JOIN users u ON l.user_id = u.user_id WHERE l.listing_id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).render('404', {
        title: 'Listing Not Found',
        user: req.session.user || null,
      });
    }

    const listing = result.rows[0];

    // Get amenities
    const amenitiesResult = await db.query(
      'SELECT a.name FROM amenities a JOIN listing_amenities la ON a.amenity_id = la.amenity_id WHERE la.listing_id = $1',
      [listing.listing_id]
    );
    listing.amenities = amenitiesResult.rows.map(row => row.name);

    res.render('listings/detail', {
      title: listing.title,
      listing: listing,
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load listing',
      user: req.session.user || null,
    });
  }
});

// Delete listing
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    // Check if listing belongs to user
    const listingResult = await db.query(
      'SELECT user_id FROM listings WHERE listing_id = $1',
      [req.params.id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listingResult.rows[0].user_id !== req.session.user.user_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete listing (cascade will handle amenities)
    await db.query('DELETE FROM listings WHERE listing_id = $1', [req.params.id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

export default router;
