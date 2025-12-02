// Donations Routes - CRUD operations and public donation form
import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated, isManager } from '../middleware/auth.js';

const router = express.Router();

// List all donations with search (manager view)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT d.*, p.first_name, p.last_name, p.email
      FROM donation d
      JOIN person p ON d.person_id = p.person_id
    `;
    const params = [];

    if (search) {
      query += ` WHERE
        LOWER(p.first_name) LIKE LOWER($1) OR
        LOWER(p.last_name) LIKE LOWER($1) OR
        LOWER(p.email) LIKE LOWER($1)`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY d.donation_date DESC';

    const result = await pool.query(query, params);

    // Calculate total donations
    const totalResult = await pool.query('SELECT COALESCE(SUM(donation_amount), 0) as total FROM donation');

    res.render('donations/index', {
      title: 'Donations - Ella Rises',
      donations: result.rows,
      totalDonations: totalResult.rows[0].total,
      search: search || '',
    });
  } catch (err) {
    console.error('Error fetching donations:', err);
    req.flash('error', 'Error loading donations');
    res.redirect('/dashboard');
  }
});

// Public donation form - accessible to any visitor
router.get('/new', (req, res) => {
  res.render('donations/public', {
    title: 'Make a Donation - Ella Rises',
  });
});

// Process public donation
router.post('/public', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, donation_amount } = req.body;

    // Check if person exists, if not create them
    let personResult = await pool.query(
      'SELECT person_id FROM person WHERE email = $1',
      [email]
    );

    let person_id;
    if (personResult.rows.length === 0) {
      // Create new person as donor
      const newPerson = await pool.query(
        `INSERT INTO person (email, first_name, last_name, phone, role)
         VALUES ($1, $2, $3, $4, 'donor')
         RETURNING person_id`,
        [email, first_name, last_name, phone]
      );
      person_id = newPerson.rows[0].person_id;
    } else {
      person_id = personResult.rows[0].person_id;
    }

    // Create donation record
    await pool.query(
      `INSERT INTO donation (person_id, donation_date, donation_amount)
       VALUES ($1, CURRENT_DATE, $2)`,
      [person_id, donation_amount]
    );

    req.flash('success', 'Thank you for your generous donation!');
    res.redirect('/donations/thank-you');
  } catch (err) {
    console.error('Error processing donation:', err);
    req.flash('error', 'Error processing donation. Please try again.');
    res.redirect('/donations/new');
  }
});

// Thank you page after donation
router.get('/thank-you', (req, res) => {
  res.render('donations/thank-you', {
    title: 'Thank You - Ella Rises',
  });
});

// Create donation form (manager)
router.get('/create/new', isManager, async (req, res) => {
  try {
    const persons = await pool.query(
      `SELECT person_id, first_name, last_name, email
       FROM person
       ORDER BY last_name, first_name`
    );

    res.render('donations/create', {
      title: 'Add Donation - Ella Rises',
      persons: persons.rows,
    });
  } catch (err) {
    console.error('Error loading create form:', err);
    req.flash('error', 'Error loading form');
    res.redirect('/donations');
  }
});

// Create donation (manager)
router.post('/', isManager, async (req, res) => {
  try {
    const { person_id, donation_date, donation_amount } = req.body;

    await pool.query(
      `INSERT INTO donation (person_id, donation_date, donation_amount)
       VALUES ($1, $2, $3)`,
      [person_id, donation_date, donation_amount]
    );

    req.flash('success', 'Donation recorded successfully');
    res.redirect('/donations');
  } catch (err) {
    console.error('Error creating donation:', err);
    req.flash('error', 'Error recording donation');
    res.redirect('/donations/create/new');
  }
});

// Edit donation form
router.get('/:id/edit', isManager, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT d.*, p.first_name, p.last_name, p.email
       FROM donation d
       JOIN person p ON d.person_id = p.person_id
       WHERE d.donation_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'Donation not found');
      return res.redirect('/donations');
    }

    const persons = await pool.query(
      `SELECT person_id, first_name, last_name, email
       FROM person
       ORDER BY last_name, first_name`
    );

    res.render('donations/edit', {
      title: 'Edit Donation - Ella Rises',
      donation: result.rows[0],
      persons: persons.rows,
    });
  } catch (err) {
    console.error('Error fetching donation:', err);
    req.flash('error', 'Error loading donation');
    res.redirect('/donations');
  }
});

// Update donation
router.post('/:id', isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { person_id, donation_date, donation_amount } = req.body;

    await pool.query(
      `UPDATE donation SET person_id = $1, donation_date = $2, donation_amount = $3
       WHERE donation_id = $4`,
      [person_id, donation_date, donation_amount, id]
    );

    req.flash('success', 'Donation updated successfully');
    res.redirect('/donations');
  } catch (err) {
    console.error('Error updating donation:', err);
    req.flash('error', 'Error updating donation');
    res.redirect(`/donations/${req.params.id}/edit`);
  }
});

// Delete donation
router.post('/:id/delete', isManager, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM donation WHERE donation_id = $1', [id]);

    req.flash('success', 'Donation deleted successfully');
    res.redirect('/donations');
  } catch (err) {
    console.error('Error deleting donation:', err);
    req.flash('error', 'Error deleting donation');
    res.redirect('/donations');
  }
});

export default router;
