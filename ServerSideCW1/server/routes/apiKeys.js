const express = require('express');
const { db } = require('../db/createDatabase');
const { verifyToken } = require('../middleware/auth');
const { generateApiKey, generateExpiryDate, formatApiKey } = require('../utils/apiKeyUtils');

const router = express.Router();

// Get all API keys for the authenticated user
router.get('/', verifyToken, (req, res) => {
    db.all(
        'SELECT id, key, name, created_at, expires_at, is_active, last_used_at, usage_count FROM api_keys WHERE user_id = ?',
        [req.user.id],
        (err, keys) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }

            // Debug info on fetched keys
            console.log(`Found ${keys.length} API keys for user ${req.user.id}`);

            // Make sure the keys are properly formatted before sending them
            const formattedKeys = keys.map(key => ({
                ...key,
                key: key.key.trim() // Ensure no whitespace in key
            }));

            return res.status(200).json({
                success: true,
                keys: formattedKeys
            });
        }
    );
});

// Generate a new API key
router.post('/', verifyToken, (req, res) => {
    const { name, expiryDays } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'API key name is required'
        });
    }

    // Generate a new API key
    const apiKey = generateApiKey();
    const expiryDate = expiryDays ? generateExpiryDate(expiryDays) : null;

    // Check for existing keys and ensure we set is_active properly
    console.log(`Creating new API key for user ${req.user.id} with name "${name}"`);

    // Save the API key to the database - explicitly setting is_active to 1
    db.run(
        'INSERT INTO api_keys (user_id, key, name, expires_at, is_active) VALUES (?, ?, ?, ?, 1)',
        [req.user.id, apiKey, name, expiryDate],
        function (err) {
            if (err) {
                console.error('Error creating API key:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating API key'
                });
            }

            console.log(`New API key created with ID ${this.lastID} and is_active=1`);

            return res.status(201).json({
                success: true,
                message: 'API key created successfully',
                key: {
                    id: this.lastID,
                    key: apiKey, // Send the full key only once
                    name,
                    created_at: new Date().toISOString(),
                    expires_at: expiryDate ? expiryDate.toISOString() : null,
                    is_active: 1
                }
            });
        }
    );
});

// Delete an API key
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    // Verify ownership of the key
    db.get('SELECT * FROM api_keys WHERE id = ? AND user_id = ?', [id, req.user.id], (err, key) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found or not authorized'
            });
        }

        // Delete the key
        db.run('DELETE FROM api_keys WHERE id = ?', [id], (deleteErr) => {
            if (deleteErr) {
                console.error('Error deleting API key:', deleteErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting API key'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'API key deleted successfully'
            });
        });
    });
});

// Activate/deactivate an API key
router.patch('/:id/toggle', verifyToken, (req, res) => {
    const { id } = req.params;

    // Verify ownership of the key
    db.get('SELECT * FROM api_keys WHERE id = ? AND user_id = ?', [id, req.user.id], (err, key) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found or not authorized'
            });
        }

        // Toggle the active status
        const newStatus = key.is_active === 1 ? 0 : 1;

        db.run('UPDATE api_keys SET is_active = ? WHERE id = ?', [newStatus, id], (updateErr) => {
            if (updateErr) {
                console.error('Error updating API key:', updateErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating API key'
                });
            }

            return res.status(200).json({
                success: true,
                message: `API key ${newStatus ? 'activated' : 'deactivated'} successfully`,
                key: {
                    ...key,
                    is_active: newStatus,
                    key: formatApiKey(key.key)
                }
            });
        });
    });
});

// Get API key usage statistics
router.get('/:id/usage', verifyToken, (req, res) => {
    const { id } = req.params;

    // Verify ownership of the key
    db.get('SELECT * FROM api_keys WHERE id = ? AND user_id = ?', [id, req.user.id], (err, key) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API key not found or not authorized'
            });
        }

        // Get usage statistics
        db.all('SELECT * FROM api_key_usage WHERE api_key_id = ? ORDER BY request_timestamp DESC', [id], (usageErr, usage) => {
            if (usageErr) {
                console.error('Error retrieving API key usage:', usageErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error retrieving API key usage'
                });
            }

            // Get usage summary by endpoint
            db.all(
                'SELECT endpoint, COUNT(*) as count FROM api_key_usage WHERE api_key_id = ? GROUP BY endpoint',
                [id],
                (summaryErr, summary) => {
                    if (summaryErr) {
                        console.error('Error retrieving usage summary:', summaryErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Error retrieving usage summary'
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        key: {
                            ...key,
                            key: formatApiKey(key.key)
                        },
                        usage,
                        summary,
                        usage_count: key.usage_count,
                        last_used_at: key.last_used_at
                    });
                }
            );
        });
    });
});

// Add a diagnostic route to check all keys
router.get('/check-status', verifyToken, (req, res) => {
    db.all(
        'SELECT id, key, name, created_at, expires_at, is_active FROM api_keys WHERE user_id = ?',
        [req.user.id],
        (err, keys) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }

            console.log("API Keys Status:");
            keys.forEach(key => {
                console.log(`ID: ${key.id}, Name: ${key.name}, Active: ${key.is_active}, KeyStart: ${key.key.substring(0, 8)}`);
            });

            // Count active keys
            const activeKeys = keys.filter(key => key.is_active === 1);
            console.log(`Total keys: ${keys.length}, Active keys: ${activeKeys.length}`);

            return res.status(200).json({
                success: true,
                keysCount: keys.length,
                activeKeysCount: activeKeys.length,
                keys: keys.map(key => ({
                    id: key.id,
                    name: key.name,
                    isActive: key.is_active === 1,
                    keyPreview: key.key.substring(0, 8) + '...'
                }))
            });
        }
    );
});

// Get all API key usage logs for the authenticated user
router.get('/logs', verifyToken, (req, res) => {
    // Query to get all logs with API key info joined
    const query = `
        SELECT 
            u.id as usage_id,
            u.api_key_id,
            u.endpoint,
            u.request_timestamp,
            k.name as key_name,
            k.key as key_value
        FROM api_key_usage u
        JOIN api_keys k ON u.api_key_id = k.id
        WHERE k.user_id = ?
        ORDER BY u.request_timestamp DESC
    `;

    db.all(query, [req.user.id], (err, logs) => {
        if (err) {
            console.error('Error fetching API key logs:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching API key logs'
            });
        }

        // Format the key values for security
        const formattedLogs = logs.map(log => ({
            ...log,
            key_value: formatApiKey(log.key_value)
        }));

        return res.status(200).json({
            success: true,
            logs: formattedLogs
        });
    });
});

module.exports = router; 