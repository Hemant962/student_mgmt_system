// routes/assignments.js
const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { class: cls, subject } = req.query;
    const query = {};
    if (cls) query.class = cls;
    if (subject) query.subject = subject;
    const assignments = await Assignment.find(query).populate('createdBy', 'name').sort({ dueDate: 1 });
    res.json({ success: true, assignments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, assignment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/:id/submit', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    const alreadySubmitted = assignment.submissions.find(s => s.student.toString() === req.user._id.toString());
    if (alreadySubmitted) return res.status(400).json({ success: false, message: 'Already submitted' });
    const isLate = new Date() > new Date(assignment.dueDate);
    assignment.submissions.push({ student: req.user._id, submittedAt: new Date(), files: req.body.files || [], status: isLate ? 'late' : 'submitted' });
    await assignment.save();
    res.json({ success: true, message: 'Assignment submitted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/grade/:studentId', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    const sub = assignment.submissions.find(s => s.student.toString() === req.params.studentId);
    if (sub) { sub.marksObtained = req.body.marks; sub.feedback = req.body.feedback; sub.status = 'graded'; }
    await assignment.save();
    res.json({ success: true, message: 'Graded successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
