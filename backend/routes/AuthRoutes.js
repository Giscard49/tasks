const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const router = express.Router();

function createToken(user) {
    return jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
    return { id: user.id, username: user.username };
}

router.post('/register', async (req, res, next) => {
    try {
        const username = String(req.body.username || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        if (!/^[a-z0-9_]{3,30}$/.test(username)) {
            return res.status(400).json({ message: 'Username must be 3-30 letters, numbers, or underscores' });
        }
        if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
        if (await User.exists({ username })) return res.status(409).json({ message: 'Username is already taken' });

        const user = await User.create({ username, passwordHash: await bcrypt.hash(password, 12) });
        res.status(201).json({ token: createToken(user), user: publicUser(user) });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const username = String(req.body.username || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const user = await User.findOne({ username }).select('+passwordHash');
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        res.json({ token: createToken(user), user: publicUser(user) });
    } catch (error) {
        next(error);
    }
});

module.exports = router;