// routes/analytics.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const { protect, authorize } = require('../middleware/auth');

router.get('/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.countDocuments({ date: new Date(today), status: 'present' });
    const avgAttendance = totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0;

    const recentMarks = await Marks.find().sort({ createdAt: -1 }).limit(10).populate('student', 'name');

    res.json({ success: true, overview: { totalStudents, totalTeachers, avgAttendance, todayPresent: todayAttendance, recentMarks } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/class/:class', protect, async (req, res) => {
  try {
    const cls = req.params.class;
    const students = await User.find({ role: 'student', 'studentProfile.class': cls, isActive: true });
    const studentIds = students.map(s => s._id);

    const attendanceRecords = await Attendance.find({ student: { $in: studentIds } });
    const marksRecords = await Marks.find({ student: { $in: studentIds } });

    const attendanceStats = {};
    studentIds.forEach(id => {
      const records = attendanceRecords.filter(r => r.student.toString() === id.toString());
      const present = records.filter(r => r.status === 'present').length;
      attendanceStats[id] = records.length > 0 ? Math.round((present / records.length) * 100) : 0;
    });

    res.json({ success: true, students: students.length, attendanceStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
