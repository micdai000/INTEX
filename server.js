// Ella Rises INTEX - Express Server
// Main entry point for the application

import express from 'express';
import session from 'express-session';
import expressLayouts from 'express-ejs-layouts';
import flash from 'connect-flash';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import participantsRoutes from './routes/participants.js';
import eventsRoutes from './routes/events.js';
import surveysRoutes from './routes/surveys.js';
import milestonesRoutes from './routes/milestones.js';
import donationsRoutes from './routes/donations.js';
import usersRoutes from './routes/users.js';
import contactRoutes from './routes/contact.js';

// ES module path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup - EJS with layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration for authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ella-rises-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  })
);

// Flash messages for user feedback
app.use(flash());

// Make user and flash messages available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isManager = req.session.user?.role === 'manager';
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// HTTP 418 - I'm a teapot (required for IS 404)
app.get('/teapot', (req, res) => {
  res.status(418).render('teapot', {
    title: "I'm a Teapot - Ella Rises",
  });
});

// Workshops page
app.get('/workshops', (req, res) => {
  res.render('workshops', {
    title: 'Workshops & Events - Ella Rises',
  });
});

// Route handlers
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/participants', participantsRoutes);
app.use('/events', eventsRoutes);
app.use('/surveys', surveysRoutes);
app.use('/milestones', milestonesRoutes);
app.use('/donations', donationsRoutes);
app.use('/users', usersRoutes);
app.use('/contact', contactRoutes);

// 404 handler - page not found
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).render('error', {
    title: 'Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Ella Rises server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
