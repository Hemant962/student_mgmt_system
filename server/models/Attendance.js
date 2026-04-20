const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: String, required: true },
  section: { type: String },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'absent' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  method: { type: String, enum: ['manual', 'qr', 'face', 'gps'], default: 'manual' },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  lateMinutes: { type: Number, default: 0 },
  notes: { type: String },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
}, { timestamps: true });

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
