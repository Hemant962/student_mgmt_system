// routes/timetable.js
const express = require('express');
const router = express.Router();
const { Timetable } = require('../models/Other');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { class: cls, section } = req.query;
    const query = {};
    if (cls) query.class = cls;
    if (section) query.section = section;
    const timetable = await Timetable.findOne(query).populate('schedule.periods.teacher', 'name');
    res.json({ success: true, timetable });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const existing = await Timetable.findOne({ class: req.body.class, section: req.body.section });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.json({ success: true, timetable: existing });
    }
    const timetable = await Timetable.create(req.body);
    res.status(201).json({ success: true, timetable });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
