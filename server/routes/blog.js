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
        // Insert blog post
        const insertStmt = db.prepare(
            'INSERT INTO blog_posts (user_id, title, content, country_name, visit_date) VALUES (?, ?, ?, ?, ?)'
        );
        const result = insertStmt.run(req.user.id, title, content, country_name, visit_date);

        const blogId = result.lastInsertRowid;
        if (!blogId) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }

        // Get the created blog post
        const blogStmt = db.prepare('SELECT * FROM blog_posts WHERE id = ?');
        const blog = blogStmt.get(blogId);

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            blog
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
        const countStmt = db.prepare('SELECT COUNT(*) as total FROM blog_posts');
        const countResult = countStmt.get();
        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        // Get blog posts with user info
        const blogsQuery = `
            SELECT b.*, u.username, 
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
            FROM blog_posts b
            JOIN users u ON b.user_id = u.id
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;
        const blogsStmt = db.prepare(blogsQuery);
        const blogs = blogsStmt.all(limit, offset);

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
        const blogQuery = `
            SELECT b.*, u.username, 
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
            FROM blog_posts b
            JOIN users u ON b.user_id = u.id
            WHERE b.id = ?
        `;
        const blogStmt = db.prepare(blogQuery);
        const blog = blogStmt.get(req.params.id);

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
        const blogStmt = db.prepare('SELECT * FROM blog_posts WHERE id = ?');
        const blog = blogStmt.get(req.params.id);

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
        const updateStmt = db.prepare(
            'UPDATE blog_posts SET title = ?, content = ?, country_name = ?, visit_date = ? WHERE id = ?'
        );
        updateStmt.run(title, content, country_name, visit_date, req.params.id);

        // Get the updated blog post
        const updatedBlog = blogStmt.get(req.params.id);

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            blog: updatedBlog
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
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog post
 * @access  Private
 */
router.delete('/:id', auth, (req, res) => {
    try {
        // Check if blog post exists and belongs to the user
        const blogStmt = db.prepare('SELECT * FROM blog_posts WHERE id = ?');
        const blog = blogStmt.get(req.params.id);

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
        const deleteStmt = db.prepare('DELETE FROM blog_posts WHERE id = ?');
        deleteStmt.run(req.params.id);

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
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
        const countStmt = db.prepare('SELECT COUNT(*) as total FROM blog_posts WHERE user_id = ?');
        const countResult = countStmt.get(req.params.id);
        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        // Get blog posts
        const blogsQuery = `
            SELECT b.*, u.username, 
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
            FROM blog_posts b
            JOIN users u ON b.user_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const blogsStmt = db.prepare(blogsQuery);
        const blogs = blogsStmt.all(req.params.id, limit, offset);

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
        const countStmt = db.prepare('SELECT COUNT(*) as total FROM blog_posts WHERE country_name LIKE ?');
        const countResult = countStmt.get(`%${countryName}%`);
        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        // Get blog posts
        const blogsQuery = `
            SELECT b.*, u.username, 
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
            FROM blog_posts b
            JOIN users u ON b.user_id = u.id
            WHERE b.country_name LIKE ?
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const blogsStmt = db.prepare(blogsQuery);
        const blogs = blogsStmt.all(`%${countryName}%`, limit, offset);

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
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM blog_posts b
            JOIN follows f ON b.user_id = f.following_id
            WHERE f.follower_id = ?
        `;
        const countStmt = db.prepare(countQuery);
        const countResult = countStmt.get(req.user.id);
        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        // Get blog posts
        const blogsQuery = `
            SELECT b.*, u.username, 
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 1) as like_count,
                (SELECT COUNT(*) FROM likes WHERE blog_id = b.id AND is_like = 0) as dislike_count,
                (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
            FROM blog_posts b
            JOIN users u ON b.user_id = u.id
            JOIN follows f ON b.user_id = f.following_id
            WHERE f.follower_id = ?
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const blogsStmt = db.prepare(blogsQuery);
        const blogs = blogsStmt.all(req.user.id, limit, offset);

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
        const blogStmt = db.prepare('SELECT * FROM blog_posts WHERE id = ?');
        const blog = blogStmt.get(blogId);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Check if user already liked/disliked the post
        const likeStmt = db.prepare(
            'SELECT * FROM likes WHERE blog_id = ? AND user_id = ?'
        );
        const like = likeStmt.get(blogId, userId);

        // Convert boolean to integer (SQLite doesn't have boolean type)
        const isLikeValue = is_like ? 1 : 0;

        if (like) {
            // Update existing like/dislike
            const updateStmt = db.prepare(
                'UPDATE likes SET is_like = ? WHERE blog_id = ? AND user_id = ?'
            );
            updateStmt.run(isLikeValue, blogId, userId);

            res.json({
                success: true,
                message: is_like ? 'Blog post liked' : 'Blog post disliked'
            });
        } else {
            // Create new like/dislike
            const insertStmt = db.prepare(
                'INSERT INTO likes (blog_id, user_id, is_like) VALUES (?, ?, ?)'
            );
            insertStmt.run(blogId, userId, isLikeValue);

            res.json({
                success: true,
                message: is_like ? 'Blog post liked' : 'Blog post disliked'
            });
        }
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
        const likeStmt = db.prepare(
            'SELECT * FROM likes WHERE blog_id = ? AND user_id = ?'
        );
        const like = likeStmt.get(blogId, userId);

        if (!like) {
            return res.status(404).json({
                success: false,
                message: 'Like/dislike not found'
            });
        }

        // Delete like/dislike
        const deleteStmt = db.prepare('DELETE FROM likes WHERE blog_id = ? AND user_id = ?');
        deleteStmt.run(blogId, userId);

        res.json({
            success: true,
            message: 'Like/dislike removed'
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