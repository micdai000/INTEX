/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================================================
 *
 * Provides route protection functions for role-based access control.
 * These middleware functions are used in route definitions to restrict
 * access based on authentication status and user role.
 *
 * User Roles:
 * - 'manager': Full access to all CRUD operations and user management
 * - 'common': Read-only access to view data (no create/update/delete)
 *
 * Usage Example:
 *   router.get('/protected', isAuthenticated, (req, res) => { ... });
 *   router.post('/admin-only', isManager, (req, res) => { ... });
 *
 * ============================================================================
 */

/**
 * isAuthenticated Middleware
 *
 * Checks if the user is logged in (has an active session).
 * Use this for routes that require any authenticated user.
 *
 * Behavior:
 * - If authenticated: Calls next() to continue to route handler
 * - If not authenticated: Redirects to login page with error message
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const isAuthenticated = (req, res, next) => {
  // Check if session exists and contains user data
  if (req.session && req.session.user) {
    return next(); // User is authenticated, proceed to route
  }

  // User is not authenticated, redirect to login
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
};

/**
 * isManager Middleware
 *
 * Checks if the user has manager (admin) privileges.
 * Use this for routes that should only be accessible to managers,
 * such as create, update, and delete operations.
 *
 * Behavior:
 * - If manager: Calls next() to continue to route handler
 * - If not manager: Redirects to home page with error message
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const isManager = (req, res, next) => {
  // Check session, user data, and manager role
  if (req.session && req.session.user && req.session.user.role === 'manager') {
    return next(); // User is a manager, proceed to route
  }

  // User is not a manager (or not logged in), deny access
  req.flash('error', 'Manager access required');
  res.redirect('/');
};

/**
 * isNotAuthenticated Middleware
 *
 * Checks if the user is NOT logged in.
 * Use this for routes that should only be accessible to guests,
 * such as login and registration pages.
 *
 * Behavior:
 * - If not authenticated: Calls next() to continue to route handler
 * - If authenticated: Redirects to dashboard (user is already logged in)
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const isNotAuthenticated = (req, res, next) => {
  // Check if user is already logged in
  if (req.session && req.session.user) {
    return res.redirect('/dashboard'); // Already authenticated, go to dashboard
  }

  next(); // Not authenticated, proceed to login/signup page
};
