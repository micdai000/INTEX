// Authentication Middleware
// Handles route protection and role-based access control

// Check if user is logged in
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
};

// Check if user is a manager (admin access)
export const isManager = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'manager') {
    return next();
  }
  req.flash('error', 'Manager access required');
  res.redirect('/');
};

// Redirect authenticated users away from login/register pages
export const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};
