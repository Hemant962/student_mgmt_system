const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/students
router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { class: cls, section, search, page = 1, limit = 20 } = req.query;
    const query = { role: 'student', isActive: true };
    if (cls) query['studentProfile.class'] = cls;
    if (section) query['studentProfile.section'] = section;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    res.json({ success: true, students, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/students/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { name, email, password = 'password123', phone, studentProfile } = req.body;
    const student = await User.create({ name, email, password, phone, role: 'student', studentProfile });
    res.status(201).json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/students/:id
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Student deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/students/class/:class - Get all students by class
router.get('/class/:class', protect, async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      isActive: true,
      'studentProfile.class': req.params.class,
    }).sort({ 'studentProfile.rollNumber': 1 });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
