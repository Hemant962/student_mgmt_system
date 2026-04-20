const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User       = require('../models/User');
const Marks      = require('../models/Marks');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');

const SUBJECTS   = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Tamil'];
const CLASSES    = ['10-A', '10-B', '11-A', '11-B'];
const EXAM_TYPES = ['unit_test', 'midterm', 'final'];

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const seed = async () => {
  await connectDB();

  // Wipe everything
  await Promise.all([
    User.deleteMany({}),
    Marks.deleteMany({}),
    Attendance.deleteMany({}),
    Assignment.deleteMany({}),
  ]);
  console.log('🗑  Old data cleared');

  // ── Admin ─────────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin',
  });

  // ── Teachers ──────────────────────────────────────────────────────────────
  const teacher1 = await User.create({
    name: 'Mrs. Priya Sharma', email: 'priya@school.com', password: 'teacher123', role: 'teacher',
    teacherProfile: { subjects: ['Mathematics', 'Science'], classes: ['10-A', '10-B'], employeeId: 'T001', designation: 'Senior Teacher' },
  });
  const teacher2 = await User.create({
    name: 'Mr. Arjun Rajan', email: 'arjun@school.com', password: 'teacher123', role: 'teacher',
    teacherProfile: { subjects: ['English', 'History'], classes: ['11-A', '11-B'], employeeId: 'T002', designation: 'Teacher' },
  });
  const teacher3 = await User.create({
    name: 'Ms. Kavitha Nair', email: 'kavitha@school.com', password: 'teacher123', role: 'teacher',
    teacherProfile: { subjects: ['Computer Science', 'Tamil'], classes: ['10-A', '11-A'], employeeId: 'T003', designation: 'Teacher' },
  });
  const teachers = [teacher1, teacher2, teacher3];

  // ── Parent ─────────────────────────────────────────────────────────────────
  const parent = await User.create({
    name: 'Parent User',
    email: 'parent@school.com',
    password: 'parent123',
    role: 'parent',
    phone: '+91 98765 43210',
  });

  // ── Students ──────────────────────────────────────────────────────────────
  const students = [];
  for (let i = 1; i <= 32; i++) {
    const cls     = CLASSES[Math.floor((i - 1) / 8)];
    const section = 'A';
    const student = await User.create({
      name: `Student ${i}`,
      email: `student${i}@school.com`,
      password: 'student123',
      role: 'student',
      phone: `+91 900${String(i).padStart(5, '0')}`,
      studentProfile: {
        class: cls,
        section,
        rollNumber: `${cls.replace('-', '')}-${String(i).padStart(2, '0')}`,
        parentId: parent._id,
        points: Math.floor(Math.random() * 600),
        level: Math.floor(Math.random() * 5) + 1,
        badges: [],
      },
    });
    students.push(student);
  }

  // ── Marks ─────────────────────────────────────────────────────────────────
  const marksData = [];
  for (const student of students) {
    for (const subject of SUBJECTS) {
      for (const examType of EXAM_TYPES) {
        const base = 30 + Math.floor(Math.random() * 65); // 30–94
        marksData.push({
          student:        student._id,
          subject,
          examName:       `${examType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} - ${subject}`,
          examType,
          marksObtained:  base,
          maxMarks:       100,
          class:          student.studentProfile.class,
          section:        student.studentProfile.section,
          markedBy:       teachers[0]._id,
          examDate:       new Date(Date.now() - Math.random() * 90 * 864e5),
        });
      }
    }
  }
  await Marks.insertMany(marksData);
  console.log(`✅ ${marksData.length} mark records created`);

  // ── Attendance (last 60 school days) ──────────────────────────────────────
  const attData = [];
  for (const student of students) {
    for (let d = 60; d >= 1; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const day = date.getDay();
      if (day === 0 || day === 6) continue; // skip weekends
      const r = Math.random();
      attData.push({
        student:  student._id,
        class:    student.studentProfile.class,
        section:  student.studentProfile.section,
        date,
        status:   r > 0.15 ? 'present' : r > 0.07 ? 'late' : 'absent',
        method:   'manual',
        markedBy: teachers[0]._id,
      });
    }
  }
  await Attendance.insertMany(attData);
  console.log(`✅ ${attData.length} attendance records created`);

  // ── Assignments ────────────────────────────────────────────────────────────
  await Assignment.insertMany([
    {
      title: 'Mathematics Problem Set', description: 'Solve chapters 5–7 problems on quadratic equations.',
      subject: 'Mathematics', class: '10-A', dueDate: new Date(Date.now() + 7 * 864e5),
      maxMarks: 50, createdBy: teachers[0]._id, status: 'active',
    },
    {
      title: 'English Essay', description: 'Write a 500-word essay on the impact of social media.',
      subject: 'English', class: '11-A', dueDate: new Date(Date.now() + 5 * 864e5),
      maxMarks: 100, createdBy: teachers[1]._id, status: 'active',
    },
    {
      title: 'Science Lab Report', description: 'Document your titration experiment findings.',
      subject: 'Science', class: '10-B', dueDate: new Date(Date.now() + 3 * 864e5),
      maxMarks: 75, createdBy: teachers[0]._id, status: 'active',
    },
    {
      title: 'Tamil Grammar Exercise', description: 'Complete exercises 1–10 from chapter 3.',
      subject: 'Tamil', class: '10-A', dueDate: new Date(Date.now() + 4 * 864e5),
      maxMarks: 30, createdBy: teachers[2]._id, status: 'active',
    },
  ]);
  console.log('✅ Assignments created');

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('  👑  Admin   : admin@school.com   / admin123');
  console.log('  👩‍🏫  Teacher : priya@school.com  / teacher123');
  console.log('  👨‍🎓  Student : student1@school.com / student123');
  console.log('  👨‍👩‍👦  Parent  : parent@school.com / parent123');
  console.log('─────────────────────────────────────────\n');

  mongoose.disconnect();
};

seed().catch((err) => { console.error('Seed error:', err); mongoose.disconnect(); });
