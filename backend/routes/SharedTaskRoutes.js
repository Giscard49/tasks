const express = require('express');
const router = express.Router();
const SharedTask = require('../models/SharedTask');

router.get('/tasks', async (req, res) => {
    try {
        const tasks = await SharedTask.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/tasks', async (req, res) => {
    const task = new SharedTask({
        title: req.body.title,
        priority: req.body.priority, 
        completed: req.body.completed,
        userId: req.body.userId,
        date: req.body.date,
        time: req.body.time
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;    