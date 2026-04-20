const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'file', 'image'], default: 'text' },
  fileUrl: { type: String },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['attendance', 'marks', 'assignment', 'exam', 'general', 'alert'], default: 'general' },
  isRead: { type: Boolean, default: false },
  link: { type: String },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
}, { timestamps: true });

const timetableSchema = new mongoose.Schema({
  class: { type: String, required: true },
  section: { type: String },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  schedule: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
    periods: [{
      periodNumber: Number,
      subject: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      startTime: String,
      endTime: String,
      room: String,
    }]
  }],
}, { timestamps: true });

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true },
  address: { type: String },
  email: { type: String },
  phone: { type: String },
  logo: { type: String },
  subscription: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
  Message: mongoose.model('Message', messageSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Timetable: mongoose.model('Timetable', timetableSchema),
  School: mongoose.model('School', schoolSchema),
};
