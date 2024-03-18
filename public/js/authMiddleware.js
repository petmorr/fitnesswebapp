// authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from request headers
    if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.id;
        next();
    });
};

module.exports = { verifyToken };
