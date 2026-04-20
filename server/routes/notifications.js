const express = require('express');
const router = express.Router();
const { Notification } = require('../models/Other');
const { protect, authorize } = require('../middleware/auth');

// GET /api/notifications - Get user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/notifications - Create notification (admin/teacher)
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { recipients, title, message, type, link } = req.body;
    const notifications = await Notification.insertMany(
      recipients.map(r => ({ recipient: r, title, message, type, link }))
    );
    res.status(201).json({ success: true, notifications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/notifications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
