const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String },
  dueDate: { type: Date, required: true },
  maxMarks: { type: Number, default: 100 },
  attachments: [{ name: String, url: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date },
    files: [{ name: String, url: String }],
    marksObtained: { type: Number },
    feedback: { type: String },
    status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
  }],
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
