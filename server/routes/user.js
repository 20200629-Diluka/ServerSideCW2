const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile
 * @access  Public
 */
router.get('/:id', (req, res) => {
    try {
        const userStmt = db.prepare(
            'SELECT id, username, email, created_at FROM users WHERE id = ?'
        );
        const user = userStmt.get(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get follower count
        const followerStmt = db.prepare(
            'SELECT COUNT(*) as followerCount FROM follows WHERE following_id = ?'
        );
        const followerResult = followerStmt.get(req.params.id);

        // Get following count
        const followingStmt = db.prepare(
            'SELECT COUNT(*) as followingCount FROM follows WHERE follower_id = ?'
        );
        const followingResult = followingStmt.get(req.params.id);

        // Get blog count
        const blogStmt = db.prepare(
            'SELECT COUNT(*) as blogCount FROM blog_posts WHERE user_id = ?'
        );
        const blogResult = blogStmt.get(req.params.id);

        res.json({
            success: true,
            user: {
                ...user,
                followerCount: followerResult.followerCount,
                followingCount: followingResult.followingCount,
                blogCount: blogResult.blogCount
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
 * @route   POST /api/users/follow/:id
 * @desc    Follow a user
 * @access  Private
 */
router.post('/follow/:id', auth, (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;

    // Prevent following yourself
    if (followerId === parseInt(followingId)) {
        return res.status(400).json({
            success: false,
            message: 'You cannot follow yourself'
        });
    }

    try {
        // Check if user to follow exists
        const userStmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = userStmt.get(followingId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User to follow not found'
            });
        }

        // Check if already following
        const followStmt = db.prepare(
            'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?'
        );
        const follow = followStmt.get(followerId, followingId);

        if (follow) {
            return res.status(400).json({
                success: false,
                message: 'Already following this user'
            });
        }

        // Create follow relationship
        const insertStmt = db.prepare(
            'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)'
        );
        const result = insertStmt.run(followerId, followingId);

        res.json({
            success: true,
            message: 'User followed successfully',
            followId: result.lastInsertRowid
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
 * @route   DELETE /api/users/unfollow/:id
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete('/unfollow/:id', auth, (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;

    try {
        // Check if following relationship exists
        const followStmt = db.prepare(
            'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?'
        );
        const follow = followStmt.get(followerId, followingId);

        if (!follow) {
            return res.status(400).json({
                success: false,
                message: 'You are not following this user'
            });
        }

        // Delete follow relationship
        const deleteStmt = db.prepare(
            'DELETE FROM follows WHERE follower_id = ? AND following_id = ?'
        );
        deleteStmt.run(followerId, followingId);

        res.json({
            success: true,
            message: 'User unfollowed successfully'
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
 * @route   GET /api/users/:id/followers
 * @desc    Get user followers
 * @access  Public
 */
router.get('/:id/followers', (req, res) => {
    try {
        const followersQuery = `
            SELECT u.id, u.username, u.email, u.created_at 
            FROM follows f
            JOIN users u ON f.follower_id = u.id
            WHERE f.following_id = ?
        `;
        const followersStmt = db.prepare(followersQuery);
        const followers = followersStmt.all(req.params.id);

        res.json({
            success: true,
            followers
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
 * @route   GET /api/users/:id/following
 * @desc    Get users that this user is following
 * @access  Public
 */
router.get('/:id/following', (req, res) => {
    try {
        const followingQuery = `
            SELECT u.id, u.username, u.email, u.created_at 
            FROM follows f
            JOIN users u ON f.following_id = u.id
            WHERE f.follower_id = ?
        `;
        const followingStmt = db.prepare(followingQuery);
        const following = followingStmt.all(req.params.id);

        res.json({
            success: true,
            following
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