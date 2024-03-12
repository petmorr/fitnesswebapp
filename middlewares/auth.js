const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Extract the token from the Authorization header or cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' }); // Token is not valid
        }
        req.user = user;
        next();
    });
};

module.exports = authMiddleware;