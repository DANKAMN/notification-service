const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /users/ -> create a user
router.post('/', async (req, res) => {
  try {
    const { name, email, notificationDelayMinutes } = req.body;

    const user = await User.create({
      name,
      email,
      notificationDelayMinutes: notificationDelayMinutes || 1 // default 1 min
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/ -> list all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
