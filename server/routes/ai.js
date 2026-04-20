const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

// GET /api/ai/recommendations/:studentId
router.get('/recommendations/:studentId', protect, async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.params.studentId });
    const attendance = await Attendance.find({ student: req.params.studentId });

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
    }));

    const weakSubjects = subjectAverages.filter(s => s.average < 60);
    const strongSubjects = subjectAverages.filter(s => s.average >= 80);

    const recommendations = weakSubjects.map(s => ({
      subject: s.subject,
      type: 'weak',
      suggestion: `Focus on ${s.subject}. Consider extra practice problems and seek help from your teacher.`,
      resources: [`${s.subject} textbook chapters`, `Online tutorial videos`, `Practice tests`],
      priority: s.average < 40 ? 'high' : 'medium',
    }));

    const present = attendance.filter(a => a.status === 'present').length;
    const attendancePct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 100;
    if (attendancePct < 75) {
      recommendations.unshift({
        subject: 'Attendance',
        type: 'attendance',
        suggestion: `Your attendance is at ${attendancePct}%. You need to attend more classes to avoid academic issues.`,
        priority: 'high',
      });
    }

    res.json({ success: true, recommendations, weakSubjects, strongSubjects, attendancePct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/ai/predict/:studentId
router.get('/predict/:studentId', protect, async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.params.studentId }).sort({ createdAt: 1 });
    const attendance = await Attendance.find({ student: req.params.studentId });

    if (marks.length === 0) {
      return res.json({ success: true, prediction: { passProbability: 50, trend: 'insufficient_data', forecast: [] } });
    }

    const percentages = marks.map(m => (m.marksObtained / m.maxMarks) * 100);
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;

    // Simple linear trend
    const recent = percentages.slice(-3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const trend = recentAvg > avg ? 'improving' : recentAvg < avg - 5 ? 'declining' : 'stable';

    const present = attendance.filter(a => a.status === 'present').length;
    const attPct = attendance.length > 0 ? (present / attendance.length) * 100 : 100;

    // Pass probability based on average and attendance
    let passProbability = Math.round((avg * 0.7) + (attPct * 0.3));
    passProbability = Math.min(99, Math.max(1, passProbability));

    // Forecast next 3 exams
    const trendDelta = trend === 'improving' ? 3 : trend === 'declining' ? -3 : 0;
    const forecast = [1, 2, 3].map(i => Math.min(100, Math.max(0, Math.round(recentAvg + trendDelta * i))));

    res.json({ success: true, prediction: { passProbability, trend, currentAvg: Math.round(avg), forecast, attPct: Math.round(attPct) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/ai/career/:studentId
router.get('/career/:studentId', protect, async (req, res) => {
  try {
    const marks = await Marks.find({ student: req.params.studentId });

    const subjectStats = {};
    marks.forEach(m => {
      if (!subjectStats[m.subject]) subjectStats[m.subject] = { total: 0, count: 0 };
      subjectStats[m.subject].total += (m.marksObtained / m.maxMarks) * 100;
      subjectStats[m.subject].count++;
    });

    const subjectAverages = Object.entries(subjectStats).map(([subject, data]) => ({
      subject: subject.toLowerCase(),
      average: Math.round(data.total / data.count),
    }));

    const careerMap = {
      mathematics: ['Software Engineer', 'Data Scientist', 'Financial Analyst', 'Actuary'],
      science: ['Doctor', 'Research Scientist', 'Engineer', 'Pharmacist'],
      physics: ['Physicist', 'Aerospace Engineer', 'Robotics Engineer'],
      chemistry: ['Chemist', 'Chemical Engineer', 'Pharmacist'],
      biology: ['Doctor', 'Biologist', 'Nurse', 'Veterinarian'],
      english: ['Journalist', 'Content Writer', 'Lawyer', 'Teacher'],
      history: ['Historian', 'Archaeologist', 'Lawyer', 'Teacher'],
      economics: ['Economist', 'Business Analyst', 'Financial Planner'],
      'computer science': ['Software Developer', 'Cybersecurity Expert', 'AI Engineer'],
      art: ['Graphic Designer', 'Architect', 'Animator', 'Artist'],
    };

    const strongSubjects = subjectAverages.filter(s => s.average >= 70);
    const careers = new Set();

    strongSubjects.forEach(s => {
      const key = Object.keys(careerMap).find(k => s.subject.includes(k));
      if (key) careerMap[key].forEach(c => careers.add(c));
    });

    const suggestions = [...careers].slice(0, 6).map(career => ({
      career,
      match: Math.round(65 + Math.random() * 30),
      description: `Based on your academic performance, ${career} is a great career path for you.`,
    }));

    if (suggestions.length === 0) {
      suggestions.push(
        { career: 'General Management', match: 70, description: 'A versatile career path suitable for various backgrounds.' },
        { career: 'Business Administration', match: 65, description: 'Excellent for developing leadership and management skills.' }
      );
    }

    res.json({ success: true, suggestions: suggestions.sort((a, b) => b.match - a.match) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
