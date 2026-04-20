const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

// GET /api/reports/student/:id - Full student report data
router.get('/student/:id', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const marks = await Marks.find({ student: req.params.id }).sort({ examDate: 1 });
    const attendance = await Attendance.find({ student: req.params.id }).sort({ date: 1 });

    const present = attendance.filter(a => a.status === 'present').length;
    const attPct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

    const subjectStats = {};
    marks.forEach(m => {
      if (!subjectStats[m.subject]) subjectStats[m.subject] = { marks: [], total: 0, count: 0, exams: [] };
      const pct = (m.marksObtained / m.maxMarks) * 100;
      subjectStats[m.subject].marks.push(pct);
      subjectStats[m.subject].total += pct;
      subjectStats[m.subject].count++;
      subjectStats[m.subject].exams.push({ exam: m.examName, obtained: m.marksObtained, max: m.maxMarks, grade: m.grade });
    });

    const subjects = Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      average: Math.round(data.total / data.count),
      grade: data.exams[data.exams.length - 1]?.grade || 'N/A',
      exams: data.exams,
    }));

    const overallAvg = subjects.length
      ? Math.round(subjects.reduce((sum, s) => sum + s.average, 0) / subjects.length)
      : 0;

    let overallGrade = 'F';
    if (overallAvg >= 90) overallGrade = 'A+';
    else if (overallAvg >= 80) overallGrade = 'A';
    else if (overallAvg >= 70) overallGrade = 'B+';
    else if (overallAvg >= 60) overallGrade = 'B';
    else if (overallAvg >= 50) overallGrade = 'C';
    else if (overallAvg >= 35) overallGrade = 'D';

    res.json({
      success: true,
      report: {
        student,
        subjects,
        overallAvg,
        overallGrade,
        attendance: { total: attendance.length, present, absent: attendance.length - present, percentage: attPct },
        generatedAt: new Date(),
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/reports/class/:class - Class report
router.get('/class/:class', protect, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', 'studentProfile.class': req.params.class, isActive: true });
    const summary = [];

    for (const student of students) {
      const marks = await Marks.find({ student: student._id });
      const attendance = await Attendance.find({ student: student._id });
      const avg = marks.length
        ? Math.round(marks.reduce((s, m) => s + (m.marksObtained / m.maxMarks) * 100, 0) / marks.length)
        : 0;
      const present = attendance.filter(a => a.status === 'present').length;
      const attPct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;
      summary.push({ name: student.name, rollNumber: student.studentProfile?.rollNumber, avg, attPct });
    }

    res.json({ success: true, class: req.params.class, students: summary.sort((a, b) => b.avg - a.avg) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
