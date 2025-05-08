const jwt = require('jsonwebtoken');
const { db } = require('../db/createDatabase');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Verify API key middleware
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    //console.log('Received API key:', apiKey);

    if (!apiKey) {
        console.log('No API key provided in request');
        return res.status(401).json({
            success: false,
            message: 'API key is required'
        });
    }

    // First, check if the key exists at all regardless of is_active status
    db.get(
        'SELECT * FROM api_keys WHERE key = ?',
        [apiKey],
        (err, keyRow) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }

            if (!keyRow) {
                console.log('API key not found in database at all:', apiKey);
                // The key doesn't exist at all
                return res.status(401).json({
                    success: false,
                    message: 'Invalid API key - not found in database'
                });
            }

            // The key exists, but might be inactive
            if (keyRow.is_active !== 1) {
                console.log(`API key found but inactive (is_active=${keyRow.is_active}):`, apiKey);
                return res.status(401).json({
                    success: false,
                    message: 'API key is inactive - please activate it first'
                });
            }

            // Check expiration
            if (keyRow.expires_at && new Date(keyRow.expires_at) < new Date()) {
                console.log('API key is expired:', apiKey);
                return res.status(401).json({
                    success: false,
                    message: 'API key is expired'
                });
            }

            // Key is valid, attach it to the request
            req.apiKey = keyRow;

            // Update the last_used_at timestamp and increment usage_count
            db.run(
                'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP, usage_count = usage_count + 1 WHERE id = ?',
                [keyRow.id],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating API key usage stats:', updateErr);
                    }
                }
            );

            // Log API key usage
            const endpoint = req.originalUrl;
            db.run(
                'INSERT INTO api_key_usage (api_key_id, endpoint) VALUES (?, ?)',
                [keyRow.id, endpoint],
                (logErr) => {
                    if (logErr) {
                        console.error('Error logging API key usage:', logErr);
                    }
                }
            );

            next();
        }
    );
};

module.exports = {
    verifyToken,
    verifyApiKey
}; 