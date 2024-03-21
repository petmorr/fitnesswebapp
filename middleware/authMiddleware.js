const authenticateToken = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
      res.redirect('/login');
  }
};

module.exports = authenticateToken;