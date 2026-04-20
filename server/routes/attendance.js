const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// POST /api/attendance - Mark attendance
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body; // [{ student, status, method, lateMinutes }]
    const date = new Date().toISOString().split('T')[0];
    const results = [];

    for (const record of records) {
      const existing = await Attendance.findOne({ student: record.student, date: new Date(date) });
      if (existing) {
        existing.status = record.status;
        existing.method = record.method || 'manual';
        existing.lateMinutes = record.lateMinutes || 0;
        existing.markedBy = req.user._id;
        await existing.save();
        results.push(existing);
      } else {
        const att = await Attendance.create({
          student: record.student,
          class: record.class,
          section: record.section,
          date: new Date(date),
          status: record.status,
          method: record.method || 'manual',
          lateMinutes: record.lateMinutes || 0,
          markedBy: req.user._id,
        });
        results.push(att);
      }
    }

    res.json({ success: true, records: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance - Fetch attendance
router.get('/', protect, async (req, res) => {
  try {
    const { student, class: cls, date, month, year } = req.query;
    const query = {};

    if (student) query.student = student;
    if (cls) query.class = cls;
    if (date) query.date = new Date(date);
    if (month && year) {
      query.date = {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(Number(year), Number(month), 1),
      };
    }

    const records = await Attendance.find(query)
      .populate('student', 'name studentProfile avatar')
      .sort({ date: -1 });

    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance/stats/:studentId - Get attendance percentage
router.get('/stats/:studentId', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    // Monthly breakdown
    const monthly = {};
    records.forEach(r => {
      const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { present: 0, absent: 0, late: 0 };
      monthly[key][r.status]++;
    });

    res.json({ success: true, stats: { total, present, absent, late, percentage, monthly } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/attendance/generate-qr - Generate QR for attendance
router.post('/generate-qr', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { class: cls, section } = req.body;
    const token = uuidv4();
    const payload = JSON.stringify({ class: cls, section, token, date: new Date().toISOString(), markedBy: req.user._id });
    const qrDataUrl = await QRCode.toDataURL(payload);
    res.json({ success: true, qrCode: qrDataUrl, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/attendance/qr-scan - Mark via QR
router.post('/qr-scan', protect, async (req, res) => {
  try {
    const { qrData } = req.body;
    const payload = JSON.parse(qrData);
    const date = new Date().toISOString().split('T')[0];

    const att = await Attendance.findOneAndUpdate(
      { student: req.user._id, date: new Date(date) },
      { status: 'present', method: 'qr', class: payload.class, section: payload.section, markedBy: payload.markedBy },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Attendance marked via QR', record: att });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
