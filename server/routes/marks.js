const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const { protect, authorize } = require('../middleware/auth');

// POST /api/marks
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { entries } = req.body; // Array of mark entries
    const results = [];
    for (const entry of entries) {
      const mark = await Marks.create({ ...entry, markedBy: req.user._id });
      results.push(mark);
    }
    res.status(201).json({ success: true, marks: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/marks
router.get('/', protect, async (req, res) => {
  try {
    const { student, class: cls, subject, examType } = req.query;
    const query = {};
    if (student) query.student = student;
    if (cls) query.class = cls;
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;

    const marks = await Marks.find(query)
      .populate('student', 'name studentProfile avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/marks/stats/:studentId
router.get('/stats/:studentId', protect, async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.params.studentId });
    
    const subjectStats = {};
    marks.forEach(m => {
      if (!subjectStats[m.subject]) subjectStats[m.subject] = { marks: [], total: 0, count: 0 };
      const pct = (m.marksObtained / m.maxMarks) * 100;
      subjectStats[m.subject].marks.push(pct);
      subjectStats[m.subject].total += pct;
      subjectStats[m.subject].count++;
    });

    const subjectAverages = Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      average: Math.round(data.total / data.count),
      highest: Math.max(...data.marks),
      lowest: Math.min(...data.marks),
    }));

    const overallAvg = subjectAverages.length
      ? Math.round(subjectAverages.reduce((sum, s) => sum + s.average, 0) / subjectAverages.length)
      : 0;

    const weakSubjects = subjectAverages.filter(s => s.average < 60);

    res.json({ success: true, stats: { subjectAverages, overallAvg, weakSubjects, totalExams: marks.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/marks/class/:class/leaderboard
router.get('/class/:class/leaderboard', protect, async (req, res) => {
  try {
    const allMarks = await Marks.find({ class: req.params.class })
      .populate('student', 'name avatar studentProfile');

    const studentTotals = {};
    allMarks.forEach(m => {
      const id = m.student._id.toString();
      if (!studentTotals[id]) studentTotals[id] = { student: m.student, total: 0, count: 0 };
      studentTotals[id].total += (m.marksObtained / m.maxMarks) * 100;
      studentTotals[id].count++;
    });

    const leaderboard = Object.values(studentTotals)
      .map(s => ({ ...s, average: Math.round(s.total / s.count) }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 20);

    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/marks/:id
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const mark = await Marks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, mark });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/marks/:id
router.delete('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    await Marks.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Mark deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
