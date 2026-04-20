const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

const BADGES = {
  perfect_attendance: { name: 'Perfect Attendance', icon: '🏆', condition: 'attendance >= 100' },
  top_performer: { name: 'Top Performer', icon: '⭐', condition: 'average >= 90' },
  consistent: { name: 'Consistent Learner', icon: '📚', condition: 'exams >= 10' },
  early_bird: { name: 'Early Bird', icon: '🌅', condition: 'never_late' },
  scholar: { name: 'Scholar', icon: '🎓', condition: 'average >= 80' },
};

// GET /api/gamification/profile/:studentId
router.get('/profile/:studentId', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const marks = await Marks.find({ student: req.params.studentId });
    const attendance = await Attendance.find({ student: req.params.studentId });

    const present = attendance.filter(a => a.status === 'present').length;
    const attPct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;
    const avgMark = marks.length > 0
      ? Math.round(marks.reduce((sum, m) => sum + (m.marksObtained / m.maxMarks) * 100, 0) / marks.length)
      : 0;

    // Calculate points
    let points = student.studentProfile?.points || 0;
    let badges = student.studentProfile?.badges || [];

    // Award badges
    if (attPct === 100 && !badges.includes('perfect_attendance')) badges.push('perfect_attendance');
    if (avgMark >= 90 && !badges.includes('top_performer')) badges.push('top_performer');
    if (marks.length >= 10 && !badges.includes('consistent')) badges.push('consistent');
    if (avgMark >= 80 && !badges.includes('scholar')) badges.push('scholar');

    // Calculate level
    const level = Math.floor(points / 100) + 1;
    const pointsToNextLevel = 100 - (points % 100);

    await User.findByIdAndUpdate(req.params.studentId, {
      'studentProfile.badges': badges,
      'studentProfile.level': level,
    });

    res.json({
      success: true,
      gamification: {
        points,
        level,
        pointsToNextLevel,
        badges: badges.map(b => ({ id: b, ...BADGES[b] })),
        stats: { attPct, avgMark, totalExams: marks.length },
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/gamification/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true })
      .select('name avatar studentProfile')
      .sort({ 'studentProfile.points': -1 })
      .limit(20);

    const leaderboard = students.map((s, i) => ({
      rank: i + 1,
      name: s.name,
      avatar: s.avatar,
      points: s.studentProfile?.points || 0,
      level: s.studentProfile?.level || 1,
      badges: (s.studentProfile?.badges || []).length,
      class: s.studentProfile?.class,
    }));

    res.json({ success: true, leaderboard });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/gamification/award-points
router.post('/award-points', protect, async (req, res) => {
  try {
    const { studentId, points, reason } = req.body;
    await User.findByIdAndUpdate(studentId, {
      $inc: { 'studentProfile.points': points },
    });
    res.json({ success: true, message: `${points} points awarded for: ${reason}` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
