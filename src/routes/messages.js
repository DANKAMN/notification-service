const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// POST /messages/
router.post('/', async (req, res) => {
  try {
    const { sender_id, recipient_id, body } = req.body;

    // 1. Create the message
    const message = await Message.create({
      sender: sender_id,
      recipient: recipient_id,
      body
    });

    // 2. Find recipient user
    const recipient = await User.findById(recipient_id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // 3. Determine notification delay (default 1 min)
    const delayMinutes = recipient.notificationDelayMinutes || 1;
    const notifyAt = new Date(Date.now() + delayMinutes * 60 * 1000);

    // 4. Create notification entry
    await Notification.create({
      userId: recipient._id,
      messageId: message._id,
      email: recipient.email,
      notifyAt
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /messages/mark-read/
router.post('/mark-read', async (req, res) => {
  try {
    const { message_id } = req.body;

    // 1. Mark the message as read
    const message = await Message.findByIdAndUpdate(
      message_id,
      { is_read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // 2. Cancel any pending notifications for this message
    await Notification.deleteMany({ messageId: message._id, sent: false });

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
