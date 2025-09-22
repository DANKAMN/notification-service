const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { scheduleNotification, cancelNotificationIfNoUnread } = require('../services/notifyService');

// POST /messages/
router.post('/', async (req, res) => {
  try {
    const { sender_id, recipient_id, body } = req.body;

    const message = await Message.create({ sender: sender_id, recipient: recipient_id, body });

    const recipient = await User.findById(recipient_id);
    const delay = recipient?.notificationDelayMinutes || 1;

    await scheduleNotification(recipient_id, delay);

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /messages/mark-read/
router.post('/mark-read', async (req, res) => {
  try {
    const { message_id } = req.body;

    const message = await Message.findByIdAndUpdate(
      message_id,
      { is_read: true },
      { new: true }
    );

    if (!message) return res.status(404).json({ error: "Message not found" });

    await cancelNotificationIfNoUnread(message.recipient);

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
