const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login'); // Redirect to login page if no token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect('/login'); // Redirect to login on token verification failure
    }

    req.user = user;
    next(); // Token is valid, proceed
  });
};

module.exports = authenticateToken;