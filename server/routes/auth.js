const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide username, email, and password'
        });
    }

    try {
        // Check if user already exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with that email'
                });
            }

            // Check if username is taken
            db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (user) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username is already taken'
                    });
                }

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Insert user into database
                db.run(
                    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    [username, email, hashedPassword],
                    function (err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: 'Server error'
                            });
                        }

                        // Create JWT token
                        const payload = {
                            user: {
                                id: this.lastID
                            }
                        };

                        jwt.sign(
                            payload,
                            process.env.JWT_SECRET || 'traveltales_secret',
                            { expiresIn: '1d' },
                            (err, token) => {
                                if (err) throw err;
                                res.status(201).json({
                                    success: true,
                                    message: 'User registered successfully',
                                    token
                                });
                            }
                        );
                    }
                );
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    try {
        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Create JWT token
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET || 'traveltales_secret',
                { expiresIn: '1d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        success: true,
                        message: 'Login successful',
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email
                        }
                    });
                }
            );
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/auth/user
 * @desc    Get logged in user
 * @access  Private
 */
router.get('/user', auth, (req, res) => {
    try {
        db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', 
            [req.user.id], 
            (err, user) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                res.json({
                    success: true,
                    user
                });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 