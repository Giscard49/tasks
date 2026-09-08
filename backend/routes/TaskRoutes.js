const express = require('express');
const Task = require('../models/Task');
const User = require('../models/Users');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);

function canWrite(task, userId) {
    return task.owner.equals(userId) || task.sharedWith.some(share => share.user.equals(userId) && share.permission === 'write');
}

router.get('/', async (req, res, next) => {
    try {
        const tasks = await Task.find({ $or: [{ owner: req.user.id }, { 'sharedWith.user': req.user.id }] })
            .populate('owner', 'username').populate('sharedWith.user', 'username').sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
    try {
        const task = await Task.create({
            title: req.body.title,
            priority: req.body.priority,
            completed: req.body.completed,
            dueDate: req.body.dueDate,
            dueTime: req.body.dueTime,
            owner: req.user.id,
        });
        res.status(201).json(task);
    } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (!canWrite(task, req.user.id)) return res.status(403).json({ message: 'You cannot edit this task' });
        for (const field of ['title', 'priority', 'completed', 'dueDate', 'dueTime']) {
            if (req.body[field] !== undefined) task[field] = req.body[field];
        }
        await task.save();
        res.json(task);
    } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found or you are not the owner' });
        res.status(204).send();
    } catch (error) { next(error); }
});

router.post('/:id/share', async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found or you are not the owner' });
        const username = String(req.body.username || '').trim().toLowerCase();
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.id === req.user.id) return res.status(400).json({ message: 'You already own this task' });
        const permission = req.body.permission === 'write' ? 'write' : 'read';
        const existing = task.sharedWith.find(share => share.user.equals(user.id));
        if (existing) existing.permission = permission;
        else task.sharedWith.push({ user: user.id, permission });
        await task.save();
        res.json(await task.populate('sharedWith.user', 'username'));
    } catch (error) { next(error); }
});

router.delete('/:id/share/:userId', async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found or you are not the owner' });
        task.sharedWith = task.sharedWith.filter(share => !share.user.equals(req.params.userId));
        await task.save();
        res.status(204).send();
    } catch (error) { next(error); }
});

module.exports = router;

