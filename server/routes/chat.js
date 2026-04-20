// routes/chat.js
const express = require('express');
const router = express.Router();
const { Message } = require('../models/Other');
const { protect } = require('../middleware/auth');

router.get('/:room', protect, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ success: true, messages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const message = await Message.create({ ...req.body, sender: req.user._id });
    const populated = await message.populate('sender', 'name avatar role');
    res.status(201).json({ success: true, message: populated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
