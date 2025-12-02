// Surveys Routes - CRUD operations for post-event surveys
import express from 'express';
import pool from '../config/database.js';
import { isAuthenticated, isManager } from '../middleware/auth.js';

const router = express.Router();

// List all surveys with search
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT r.*, p.first_name, p.last_name, p.email,
             e.event_name, eo.event_datetime_start
      FROM registration r
      JOIN person p ON r.person_id = p.person_id
      JOIN event_occurrence eo ON r.event_occurrence_id = eo.event_occurrence_id
      JOIN event e ON eo.event_id = e.event_id
      WHERE r.survey_submission_date IS NOT NULL
    `;
    const params = [];

    if (search) {
      query += ` AND (
        LOWER(p.first_name) LIKE LOWER($1) OR
        LOWER(p.last_name) LIKE LOWER($1) OR
        LOWER(e.event_name) LIKE LOWER($1)
      )`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY r.survey_submission_date DESC';

    const result = await pool.query(query, params);

    res.render('surveys/index', {
      title: 'Surveys - Ella Rises',
      surveys: result.rows,
      search: search || '',
    });
  } catch (err) {
    console.error('Error fetching surveys:', err);
    req.flash('error', 'Error loading surveys');
    res.redirect('/dashboard');
  }
});

// Show single survey
router.get('/:personId/:occurrenceId', isAuthenticated, async (req, res) => {
  try {
    const { personId, occurrenceId } = req.params;

    const result = await pool.query(
      `SELECT r.*, p.first_name, p.last_name, p.email,
              e.event_name, eo.event_datetime_start, eo.event_location
       FROM registration r
       JOIN person p ON r.person_id = p.person_id
       JOIN event_occurrence eo ON r.event_occurrence_id = eo.event_occurrence_id
       JOIN event e ON eo.event_id = e.event_id
       WHERE r.person_id = $1 AND r.event_occurrence_id = $2`,
      [personId, occurrenceId]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'Survey not found');
      return res.redirect('/surveys');
    }

    res.render('surveys/show', {
      title: 'Survey Details - Ella Rises',
      survey: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching survey:', err);
    req.flash('error', 'Error loading survey');
    res.redirect('/surveys');
  }
});

// Create survey form
router.get('/create/new', isManager, async (req, res) => {
  try {
    // Get all registrations without surveys
    const registrations = await pool.query(
      `SELECT r.person_id, r.event_occurrence_id, p.first_name, p.last_name, e.event_name
       FROM registration r
       JOIN person p ON r.person_id = p.person_id
       JOIN event_occurrence eo ON r.event_occurrence_id = eo.event_occurrence_id
       JOIN event e ON eo.event_id = e.event_id
       WHERE r.survey_submission_date IS NULL
       ORDER BY e.event_name, p.last_name`
    );

    res.render('surveys/create', {
      title: 'Add Survey - Ella Rises',
      registrations: registrations.rows,
    });
  } catch (err) {
    console.error('Error loading create form:', err);
    req.flash('error', 'Error loading form');
    res.redirect('/surveys');
  }
});

// Create/Update survey
router.post('/', isManager, async (req, res) => {
  try {
    const {
      person_id, event_occurrence_id, survey_satisfaction_score, survey_usefulness_score,
      survey_instructor_score, survey_recommendation_score, survey_comments
    } = req.body;

    // Calculate overall score as average
    const scores = [survey_satisfaction_score, survey_usefulness_score, survey_instructor_score, survey_recommendation_score]
      .filter(s => s).map(Number);
    const survey_overall_score = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : null;

    await pool.query(
      `UPDATE registration SET
        survey_satisfaction_score = $1, survey_usefulness_score = $2,
        survey_instructor_score = $3, survey_recommendation_score = $4,
        survey_overall_score = $5, survey_comments = $6,
        survey_submission_date = CURRENT_TIMESTAMP
       WHERE person_id = $7 AND event_occurrence_id = $8`,
      [
        survey_satisfaction_score || null, survey_usefulness_score || null,
        survey_instructor_score || null, survey_recommendation_score || null,
        survey_overall_score, survey_comments || null,
        person_id, event_occurrence_id
      ]
    );

    req.flash('success', 'Survey saved successfully');
    res.redirect('/surveys');
  } catch (err) {
    console.error('Error saving survey:', err);
    req.flash('error', 'Error saving survey');
    res.redirect('/surveys/create/new');
  }
});

// Edit survey form
router.get('/:personId/:occurrenceId/edit', isManager, async (req, res) => {
  try {
    const { personId, occurrenceId } = req.params;

    const result = await pool.query(
      `SELECT r.*, p.first_name, p.last_name, e.event_name
       FROM registration r
       JOIN person p ON r.person_id = p.person_id
       JOIN event_occurrence eo ON r.event_occurrence_id = eo.event_occurrence_id
       JOIN event e ON eo.event_id = e.event_id
       WHERE r.person_id = $1 AND r.event_occurrence_id = $2`,
      [personId, occurrenceId]
    );

    if (result.rows.length === 0) {
      req.flash('error', 'Survey not found');
      return res.redirect('/surveys');
    }

    res.render('surveys/edit', {
      title: 'Edit Survey - Ella Rises',
      survey: result.rows[0],
    });
  } catch (err) {
    console.error('Error fetching survey:', err);
    req.flash('error', 'Error loading survey');
    res.redirect('/surveys');
  }
});

// Update survey
router.post('/:personId/:occurrenceId', isManager, async (req, res) => {
  try {
    const { personId, occurrenceId } = req.params;
    const {
      survey_satisfaction_score, survey_usefulness_score,
      survey_instructor_score, survey_recommendation_score, survey_comments
    } = req.body;

    const scores = [survey_satisfaction_score, survey_usefulness_score, survey_instructor_score, survey_recommendation_score]
      .filter(s => s).map(Number);
    const survey_overall_score = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : null;

    await pool.query(
      `UPDATE registration SET
        survey_satisfaction_score = $1, survey_usefulness_score = $2,
        survey_instructor_score = $3, survey_recommendation_score = $4,
        survey_overall_score = $5, survey_comments = $6
       WHERE person_id = $7 AND event_occurrence_id = $8`,
      [
        survey_satisfaction_score || null, survey_usefulness_score || null,
        survey_instructor_score || null, survey_recommendation_score || null,
        survey_overall_score, survey_comments || null,
        personId, occurrenceId
      ]
    );

    req.flash('success', 'Survey updated successfully');
    res.redirect(`/surveys/${personId}/${occurrenceId}`);
  } catch (err) {
    console.error('Error updating survey:', err);
    req.flash('error', 'Error updating survey');
    res.redirect(`/surveys/${req.params.personId}/${req.params.occurrenceId}/edit`);
  }
});

// Delete survey (clear survey data)
router.post('/:personId/:occurrenceId/delete', isManager, async (req, res) => {
  try {
    const { personId, occurrenceId } = req.params;

    await pool.query(
      `UPDATE registration SET
        survey_satisfaction_score = NULL, survey_usefulness_score = NULL,
        survey_instructor_score = NULL, survey_recommendation_score = NULL,
        survey_overall_score = NULL, survey_comments = NULL,
        survey_submission_date = NULL
       WHERE person_id = $1 AND event_occurrence_id = $2`,
      [personId, occurrenceId]
    );

    req.flash('success', 'Survey deleted successfully');
    res.redirect('/surveys');
  } catch (err) {
    console.error('Error deleting survey:', err);
    req.flash('error', 'Error deleting survey');
    res.redirect('/surveys');
  }
});

export default router;
