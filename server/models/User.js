const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'teacher', 'student', 'parent'], default: 'student' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  preferences: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
  },
  // Student-specific
  studentProfile: {
    class: { type: String },
    section: { type: String },
    rollNumber: { type: String },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    admissionDate: { type: Date },
    dateOfBirth: { type: Date },
    address: { type: String },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
  },
  // Teacher-specific
  teacherProfile: {
    subjects: [{ type: String }],
    classes: [{ type: String }],
    employeeId: { type: String },
    designation: { type: String },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
