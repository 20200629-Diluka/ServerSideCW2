const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/comments
 * @desc    Add a comment to a blog post
 * @access  Private
 */
router.post('/', auth, (req, res) => {
    const { blog_id, content } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!blog_id || !content) {
        return res.status(400).json({
            success: false,
            message: 'Please provide blog_id and content'
        });
    }

    try {
        // Check if blog post exists
        db.get('SELECT * FROM blog_posts WHERE id = ?', [blog_id], (err, blog) => {
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

            // Add comment
            db.run(
                'INSERT INTO comments (blog_id, user_id, content) VALUES (?, ?, ?)',
                [blog_id, user_id, content],
                function (err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            success: false,
                            message: 'Server error'
                        });
                    }

                    // Get the created comment with user info
                    db.get(
                        `SELECT c.*, u.username 
                         FROM comments c
                         JOIN users u ON c.user_id = u.id
                         WHERE c.id = ?`,
                        [this.lastID],
                        (err, comment) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Server error'
                                });
                            }

                            res.status(201).json({
                                success: true,
                                message: 'Comment added successfully',
                                comment
                            });
                        }
                    );
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
 * @route   GET /api/comments/blog/:id
 * @desc    Get comments for a blog post
 * @access  Public
 */
router.get('/blog/:id', (req, res) => {
    try {
        db.all(
            `SELECT c.*, u.username 
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.blog_id = ?
             ORDER BY c.created_at DESC`,
            [req.params.id],
            (err, comments) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                res.json({
                    success: true,
                    comments
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
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment
 * @access  Private
 */
router.delete('/:id', auth, (req, res) => {
    try {
        // Check if comment exists and belongs to the user
        db.get(
            'SELECT * FROM comments WHERE id = ?',
            [req.params.id],
            (err, comment) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (!comment) {
                    return res.status(404).json({
                        success: false,
                        message: 'Comment not found'
                    });
                }

                // Check if user is comment owner or blog post owner
                if (comment.user_id !== req.user.id) {
                    // Check if user owns the blog post
                    db.get(
                        'SELECT * FROM blog_posts WHERE id = ?',
                        [comment.blog_id],
                        (err, blog) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Server error'
                                });
                            }

                            if (!blog || blog.user_id !== req.user.id) {
                                return res.status(403).json({
                                    success: false,
                                    message: 'Not authorized to delete this comment'
                                });
                            }

                            // Delete comment
                            deleteComment(req.params.id, res);
                        }
                    );
                } else {
                    // User is comment owner, delete comment
                    deleteComment(req.params.id, res);
                }
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

// Helper function to delete a comment
function deleteComment(commentId, res) {
    db.run(
        'DELETE FROM comments WHERE id = ?',
        [commentId],
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
                message: 'Comment deleted successfully'
            });
        }
    );
}

module.exports = router; 