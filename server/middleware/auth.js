const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens
 */
const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if token exists
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'No token, authorization denied' 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'traveltales_secret');
        
        // Add user ID to request
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ 
            success: false, 
            message: 'Token is not valid' 
        });
    }
};

module.exports = auth; 