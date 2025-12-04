/**
 * ============================================================================
 * ELLA RISES INTEX - Main Express Server
 * ============================================================================
 *
 * This is the main entry point for the Ella Rises web application.
 * The application is built with Express.js and uses EJS templating.
 *
 * Project: IS 402/403/404/415 INTEX - Fall 2025
 * Organization: Ella Rises (https://www.ellarises.org/)
 * Purpose: Event management, participant tracking, surveys, and donations
 *
 * Features:
 * - User authentication with manager/viewer roles
 * - CRUD operations for participants, events, surveys, milestones, donations
 * - Embedded Tableau dashboard for data visualization
 * - Public-facing landing page and donation portal
 * - Mobile-responsive design with ADA compliance
 *
 * Deployment: AWS Elastic Beanstalk with RDS PostgreSQL
 *
 * ============================================================================
 */

// =============================================================================
// IMPORTS - External Dependencies
// =============================================================================

import express from 'express';           // Web application framework
import session from 'express-session';   // Session management for authentication
import expressLayouts from 'express-ejs-layouts'; // Layout support for EJS templates
import flash from 'connect-flash';       // Flash messages for user notifications
import path from 'path';                 // File path utilities
import { fileURLToPath } from 'url';     // ES module path conversion
import dotenv from 'dotenv';             // Environment variable management

// =============================================================================
// IMPORTS - Application Routes
// =============================================================================

import indexRoutes from './routes/index.js';           // Home, about, dashboard pages
import authRoutes from './routes/auth.js';             // Login, logout, registration
import participantsRoutes from './routes/participants.js'; // Participant CRUD
import eventsRoutes from './routes/events.js';         // Event and occurrence CRUD
import surveysRoutes from './routes/surveys.js';       // Survey response CRUD
import milestonesRoutes from './routes/milestones.js'; // Milestone tracking CRUD
import donationsRoutes from './routes/donations.js';   // Donation management CRUD
import usersRoutes from './routes/users.js';           // User account management
import contactRoutes from './routes/contact.js';       // Contact form handling

// =============================================================================
// CONFIGURATION
// =============================================================================

// Load environment variables from .env file (development) or system (production)
dotenv.config();

// ES module path helpers - required because __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

// Server port - uses environment variable for production, defaults to 3000 for development
const PORT = process.env.PORT || 3000;

// =============================================================================
// EXPRESS CONFIGURATION
// =============================================================================

/**
 * Trust proxy setting for AWS Elastic Beanstalk
 * Required when running behind a load balancer to correctly identify client IPs
 * and handle secure cookies over HTTPS
 */
app.set('trust proxy', 1);

/**
 * View Engine Configuration
 * - EJS (Embedded JavaScript) is used for server-side templating
 * - express-ejs-layouts provides layout inheritance (header, footer, etc.)
 * - All views are stored in the /views directory
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // Default layout file: views/layout.ejs

// =============================================================================
// MIDDLEWARE - Request Processing
// =============================================================================

/**
 * Body Parser Middleware
 * - express.json(): Parses incoming JSON payloads
 * - express.urlencoded(): Parses URL-encoded form data (extended: true allows nested objects)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Static File Middleware
 * Serves static assets (CSS, images, JavaScript) from the /public directory
 * Files are accessible at root URL (e.g., /css/style.css maps to /public/css/style.css)
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Session Configuration
 * Manages user sessions for authentication state persistence
 *
 * Options:
 * - secret: Used to sign session cookies (should be random in production)
 * - resave: Don't save session if unmodified
 * - saveUninitialized: Don't create session until something is stored
 * - cookie: Session cookie settings for security
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ella-rises-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.FORCE_HTTPS === 'true', // HTTPS only in production
      httpOnly: true,                              // Prevents XSS attacks
      maxAge: 24 * 60 * 60 * 1000,                // Session expires in 24 hours
      sameSite: 'lax',                            // CSRF protection
    },
  })
);

/**
 * Flash Messages Middleware
 * Enables one-time messages that persist across redirects
 * Used for success/error notifications after form submissions
 */
app.use(flash());

/**
 * Global Template Variables Middleware
 * Makes user data and flash messages available to all EJS templates
 * This runs on every request before route handlers
 */
app.use((req, res, next) => {
  // User authentication state
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isManager = req.session.user?.role === 'manager';

  // Flash message arrays
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');

  next(); // Continue to next middleware/route
});

// =============================================================================
// SPECIAL ROUTES
// =============================================================================

/**
 * HTTP 418 - I'm a Teapot
 * Required endpoint for IS 404 course requirement
 * Returns the humorous HTTP 418 status code as defined in RFC 2324
 */
app.get('/teapot', (req, res) => {
  res.status(418).render('teapot', {
    title: "I'm a Teapot - Ella Rises",
  });
});

/**
 * Workshops Page
 * Public page displaying information about Ella Rises programs and workshops
 */
app.get('/workshops', (req, res) => {
  res.render('workshops', {
    title: 'Workshops & Events - Ella Rises',
  });
});

// =============================================================================
// ROUTE MOUNTING
// =============================================================================

/**
 * Mount route handlers to their respective URL paths
 * Each route module handles its own endpoints and database operations
 */
app.use('/', indexRoutes);              // Root routes: /, /about, /dashboard
app.use('/auth', authRoutes);           // Authentication: /auth/login, /auth/logout
app.use('/participants', participantsRoutes); // /participants/*
app.use('/events', eventsRoutes);       // /events/*
app.use('/surveys', surveysRoutes);     // /surveys/*
app.use('/milestones', milestonesRoutes); // /milestones/*
app.use('/donations', donationsRoutes); // /donations/*
app.use('/users', usersRoutes);         // /users/* (manager only)
app.use('/contact', contactRoutes);     // /contact

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * 404 Not Found Handler
 * Catches all requests that don't match any defined routes
 * Must be placed after all other routes
 */
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
  });
});

/**
 * Global Error Handler
 * Catches all errors thrown in route handlers
 * Logs errors to console and displays user-friendly error page
 *
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
app.use((err, req, res, next) => {
  // Log error details for debugging
  console.error('Server Error:', err.stack);

  // Render error page with appropriate message
  res.status(500).render('error', {
    title: 'Error',
    // Show detailed error in development, generic message in production
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Start the Express server
 * Listens on configured port and logs startup information
 */
app.listen(PORT, () => {
  console.log(`Ella Rises server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export app for testing purposes
export default app;
