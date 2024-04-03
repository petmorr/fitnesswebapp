// Middleware function to authenticate token
const authenticateToken = (req, res, next) => {
  // Check if the user is authenticated
  if (req.session.isAuthenticated) {
    // If authenticated, proceed to the next middleware or route handler
    next();
  } else {
    // If not authenticated, redirect the user to the login page
    res.redirect('/login');
  }
};

// Export the authenticateToken middleware function
module.exports = authenticateToken;