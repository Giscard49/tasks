const express = require('express');
const User = require('../models/Users');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/search', requireAuth, async (req, res, next) => {
    try {
        const query = String(req.query.q || '').trim().toLowerCase();
        if (query.length < 2) return res.json([]);
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const users = await User.find({
            username: { $regex: `^${escapedQuery}`, $options: 'i' },
            _id: { $ne: req.user.id },
        }).select('_id username').limit(10);
        res.json(users.map(user => ({ id: user.id, username: user.username })));
    } catch (error) {
        next(error);
    }
});

module.exports = router;