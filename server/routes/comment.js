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
        const blogStmt = db.prepare('SELECT * FROM blog_posts WHERE id = ?');
        const blog = blogStmt.get(blog_id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Add comment
        const insertStmt = db.prepare(
            'INSERT INTO comments (blog_id, user_id, content) VALUES (?, ?, ?)'
        );
        const result = insertStmt.run(blog_id, user_id, content);

        const commentId = result.lastInsertRowid;
        if (!commentId) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }

        // Get the created comment with user info
        const commentQuery = `
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `;
        const commentStmt = db.prepare(commentQuery);
        const comment = commentStmt.get(commentId);

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment
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
        const commentQuery = `
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.blog_id = ?
            ORDER BY c.created_at DESC
        `;
        const commentsStmt = db.prepare(commentQuery);
        const comments = commentsStmt.all(req.params.id);

        res.json({
            success: true,
            comments
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
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment
 * @access  Private
 */
router.delete('/:id', auth, (req, res) => {
    try {
        // Check if comment exists and belongs to the user
        const commentStmt = db.prepare('SELECT * FROM comments WHERE id = ?');
        const comment = commentStmt.get(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is comment owner or blog post owner
        if (comment.user_id !== req.user.id) {
            // Check if user owns the blog post
            const blogStmt = db.prepare('SELECT * FROM blog_posts WHERE id = ?');
            const blog = blogStmt.get(comment.blog_id);

            if (!blog || blog.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this comment'
                });
            }
        }

        // Delete comment
        const deleteStmt = db.prepare('DELETE FROM comments WHERE id = ?');
        deleteStmt.run(req.params.id);

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 