const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/blogs
 * @desc    Create a blog post
 * @access  Private
 */
router.post('/', auth, (req, res) => {
    const { title, content, country_name, visit_date } = req.body;
    
    // Validate input
    if (!title || !content || !country_name || !visit_date) {
        return res.status(400).json({
            success: false,
            message: 'Please provide title, content, country name, and visit date'
        });
    }

    try {
        db.run(
            'INSERT INTO blog_posts (user_id, title, content, country_name, visit_date) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, title, content, country_name, visit_date],
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                // Get the created blog post
                db.get(
                    'SELECT * FROM blog_posts WHERE id = ?',
                    [this.lastID],
                    (err, blog) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: 'Server error'
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: 'Blog post created successfully',
                            blog
                        });
                    }
                );
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

/**
 * @route   GET /api/blogs
 * @desc    Get all blog posts with pagination
 * @access  Public
 */
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'newest'; // newest, liked, commented

    let orderBy;
                switch (sort) {
        case 'liked':
            orderBy = `(SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) DESC`;
            break;
        case 'commented':
            orderBy = `(SELECT COUNT(*) FROM comments WHERE blog_id = b.id) DESC`;
            break;
        case 'newest':
        default:
            orderBy = 'b.created_at DESC';
    }

    try {
        // Get total count
        db.get('SELECT COUNT(*) as total FROM blog_posts', [], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            const total = result.total;
            const totalPages = Math.ceil(total / limit);

            // Get blog posts with user info
            db.all(
                `SELECT b.*, u.username, 
                    (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                    (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                    (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
                FROM blog_posts b
                JOIN users u ON b.user_id = u.id
                ORDER BY ${orderBy}
                LIMIT ? OFFSET ?`,
                [limit, offset],
                (err, blogs) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            success: false,
                            message: 'Server error'
                        });
                    }

                    res.json({
                        success: true,
                        blogs,
                        pagination: {
                            page,
                            limit,
                            totalItems: total,
                            totalPages
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
 * @route   GET /api/blogs/:id
 * @desc    Get a blog post by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
    try {
        db.get(
            `SELECT b.*, u.username, 
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
            FROM blog_posts b
            JOIN users u ON b.user_id = u.id
            WHERE b.id = ?`,
            [req.params.id],
            (err, blog) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (!blog) {
                    return res.status(404).json({
                        success: false,
                        message: 'Blog post not found'
                    });
                }

                res.json({
                    success: true,
                    blog
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

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update a blog post
 * @access  Private
 */
router.put('/:id', auth, (req, res) => {
    const { title, content, country_name, visit_date } = req.body;
    
    // Validate input
    if (!title || !content || !country_name || !visit_date) {
        return res.status(400).json({
            success: false,
            message: 'Please provide title, content, country name, and visit date'
        });
    }

    try {
        // Check if blog post exists and belongs to the user
        db.get(
            'SELECT * FROM blog_posts WHERE id = ?',
            [req.params.id],
            (err, blog) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (!blog) {
                    return res.status(404).json({
                        success: false,
                        message: 'Blog post not found'
                    });
                }

                if (blog.user_id !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to update this blog post'
                    });
                }

                // Update blog post
                db.run(
                    'UPDATE blog_posts SET title = ?, content = ?, country_name = ?, visit_date = ? WHERE id = ?',
                    [title, content, country_name, visit_date, req.params.id],
                    function (err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: 'Server error'
                            });
                        }

                        // Get the updated blog post
                        db.get(
                            'SELECT * FROM blog_posts WHERE id = ?',
                            [req.params.id],
                            (err, blog) => {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Server error'
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: 'Blog post updated successfully',
                                    blog
                                });
                            }
                        );
                    }
                );
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

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog post
 * @access  Private
 */
router.delete('/:id', auth, (req, res) => {
    try {
        // Check if blog post exists and belongs to the user
        db.get(
            'SELECT * FROM blog_posts WHERE id = ?',
            [req.params.id],
            (err, blog) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (!blog) {
                    return res.status(404).json({
                        success: false,
                        message: 'Blog post not found'
                    });
                }

                if (blog.user_id !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to delete this blog post'
                    });
                }

                // Delete blog post
                db.run(
                    'DELETE FROM blog_posts WHERE id = ?',
                    [req.params.id],
                    function (err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: 'Server error'
                            });
                        }

                        res.json({
                            success: true,
                            message: 'Blog post deleted successfully'
                        });
                    }
                );
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

/**
 * @route   GET /api/blogs/user/:id
 * @desc    Get blog posts by user ID
 * @access  Public
 */
router.get('/user/:id', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Get total count
        db.get(
            'SELECT COUNT(*) as total FROM blog_posts WHERE user_id = ?', 
            [req.params.id],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                const total = result.total;
                const totalPages = Math.ceil(total / limit);

                // Get blog posts
                db.all(
                    `SELECT b.*, u.username, 
                        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
                    FROM blog_posts b
                    JOIN users u ON b.user_id = u.id
                    WHERE b.user_id = ?
                    ORDER BY b.created_at DESC
                    LIMIT ? OFFSET ?`,
                    [req.params.id, limit, offset],
                    (err, blogs) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: 'Server error'
                            });
                        }

                        res.json({
                            success: true,
                            blogs,
                            pagination: {
                                page,
                                limit,
                                totalItems: total,
                                totalPages
                            }
                        });
                    }
                );
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

/**
 * @route   GET /api/blogs/country/:name
 * @desc    Get blog posts by country name
 * @access  Public
 */
router.get('/country/:name', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const countryName = req.params.name;

    try {
        // Get total count
        db.get(
            'SELECT COUNT(*) as total FROM blog_posts WHERE country_name LIKE ?', 
            [`%${countryName}%`],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                const total = result.total;
                const totalPages = Math.ceil(total / limit);

                // Get blog posts
                db.all(
                    `SELECT b.*, u.username, 
                        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
                    FROM blog_posts b
                    JOIN users u ON b.user_id = u.id
                    WHERE b.country_name LIKE ?
                    ORDER BY b.created_at DESC
                    LIMIT ? OFFSET ?`,
                    [`%${countryName}%`, limit, offset],
                    (err, blogs) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: 'Server error'
                            });
                        }

                        res.json({
                            success: true,
                            blogs,
                            pagination: {
                                page,
                                limit,
                                totalItems: total,
                                totalPages
                            }
                        });
                    }
                );
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

/**
 * @route   GET /api/blogs/feed
 * @desc    Get blog posts from users that the current user follows
 * @access  Private
 */
router.get('/feed/following', auth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Get total count
        db.get(
            `SELECT COUNT(*) as total 
             FROM blog_posts b
             JOIN follows f ON b.user_id = f.following_id
             WHERE f.follower_id = ?`, 
            [req.user.id],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                const total = result.total;
                const totalPages = Math.ceil(total / limit);

                // Get blog posts
                db.all(
                    `SELECT b.*, u.username, 
                        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                        (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                        (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
                     FROM blog_posts b
                     JOIN users u ON b.user_id = u.id
                     JOIN follows f ON b.user_id = f.following_id
                     WHERE f.follower_id = ?
                     ORDER BY b.created_at DESC
                     LIMIT ? OFFSET ?`,
                    [req.user.id, limit, offset],
                    (err, blogs) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: 'Server error'
                            });
                        }

                        res.json({
                            success: true,
                            blogs,
                            pagination: {
                                page,
                                limit,
                                totalItems: total,
                                totalPages
                            }
                        });
                    }
                );
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

/**
 * @route   POST /api/blogs/:id/like
 * @desc    Like or dislike a blog post
 * @access  Private
 */
router.post('/:id/like', auth, (req, res) => {
    const { is_like } = req.body;
    const blogId = req.params.id;
    const userId = req.user.id;

    if (is_like === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Please specify whether you like or dislike the post'
        });
    }

    try {
        // Check if blog post exists
        db.get('SELECT * FROM blog_posts WHERE id = ?', [blogId], (err, blog) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            if (!blog) {
                return res.status(404).json({
                    success: false,
                    message: 'Blog post not found'
                });
            }

            // Check if user already liked/disliked the post
            db.get(
                'SELECT * FROM likes WHERE blog_id = ? AND user_id = ?',
                [blogId, userId],
                (err, like) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            success: false,
                            message: 'Server error'
                        });
                    }

                    if (like) {
                        // Update existing like/dislike
                        db.run(
                            'UPDATE likes SET is_like = ? WHERE blog_id = ? AND user_id = ?',
                            [is_like, blogId, userId],
                            function (err) {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Server error'
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: is_like ? 'Blog post liked' : 'Blog post disliked'
                                });
                            }
                        );
                    } else {
                        // Create new like/dislike
                        db.run(
                            'INSERT INTO likes (blog_id, user_id, is_like) VALUES (?, ?, ?)',
                            [blogId, userId, is_like],
                            function (err) {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Server error'
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: is_like ? 'Blog post liked' : 'Blog post disliked'
                                });
                            }
                        );
                    }
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
 * @route   DELETE /api/blogs/:id/like
 * @desc    Remove like or dislike from a blog post
 * @access  Private
 */
router.delete('/:id/like', auth, (req, res) => {
    const blogId = req.params.id;
    const userId = req.user.id;

    try {
        // Check if like/dislike exists
        db.get(
            'SELECT * FROM likes WHERE blog_id = ? AND user_id = ?',
            [blogId, userId],
            (err, like) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (!like) {
                    return res.status(404).json({
                        success: false,
                        message: 'Like/dislike not found'
                    });
                }

                // Delete like/dislike
                db.run(
                    'DELETE FROM likes WHERE blog_id = ? AND user_id = ?',
                    [blogId, userId],
                    function (err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: 'Server error'
                            });
                        }

                        res.json({
                            success: true,
                            message: 'Like/dislike removed'
                        });
                    }
                );
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