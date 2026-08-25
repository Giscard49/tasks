const express = require('express');
const Users = require('../models/Users');
const router = express.Router();
router.get('/users', async (req, res)=> {
    const users = await Users.find();
    res.json(users);
})
router.post('/users/add', async (req, res)=> {
    const newUser = await Users.create(req.body);
    res.json(newUser);
})
module.exports = router;