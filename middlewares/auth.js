// middlewares/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Extract the token from the Authorization header or cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add decoded user payload to request object
        next();
    } catch (error) {
        console.error("Middleware error:", error);
        res.status(400).json({ error: 'Invalid token.' });
        res.status(500).json({ error: 'Internal Server Error in Middleware' });
    }
    return next();
};

module.exports = authMiddleware;