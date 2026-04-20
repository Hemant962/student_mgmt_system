const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  examName: { type: String, required: true },
  examType: { type: String, enum: ['unit_test', 'midterm', 'final', 'assignment', 'practical'], default: 'unit_test' },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, required: true },
  grade: { type: String },
  class: { type: String, required: true },
  section: { type: String },
  examDate: { type: Date },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  feedback: { type: String },
}, { timestamps: true });

marksSchema.pre('save', function (next) {
  const percentage = (this.marksObtained / this.maxMarks) * 100;
  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C';
  else if (percentage >= 35) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Marks', marksSchema);
