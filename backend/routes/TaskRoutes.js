const express = require('express');
const task = require('../models/Task.js');
const router = express.Router();

router.get('/tasks', async (req, res) => {
    const tasks = await task.find();
    res.json(tasks);
})

router.post('/tasks/add', async (req, res) => {
    const newTask = await task.create(req.body);
    res.json(newTask);
})

module.exports = router;

