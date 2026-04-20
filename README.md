# 🎓 EduNexus AI — NextGen Student Management System

> Full-stack, AI-powered Student Management System built with React.js, Node.js, and MongoDB.

---

## 📁 Project Structure

```
student-mgmt-system/
├── server/          ← Node.js + Express Backend
│   ├── models/      ← Mongoose schemas
│   ├── routes/      ← API route handlers
│   ├── middleware/  ← JWT auth middleware
│   └── utils/       ← DB connection + seed script
└── client/          ← React + Vite Frontend
    └── src/
        ├── pages/   ← All UI pages
        ├── components/ ← Reusable components
        ├── services/   ← Axios API calls
        ├── store/      ← Zustand state
        └── i18n/       ← English + Tamil
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# In /server directory
cp .env.example .env
# Edit .env and fill in your MONGO_URI and other values
```

**Required `.env` values:**
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/student_mgmt
JWT_SECRET=any_random_secret_string_here
CLIENT_URL=http://localhost:5173
```

### 3. Seed Demo Data

```bash
cd server
npm run seed
```

This creates:
- 👑 Admin: `admin@school.com` / `admin123`
- 👨‍🏫 Teacher: `priya@school.com` / `teacher123`
- 👨‍🎓 Student: `student1@school.com` / `student123`
- Plus 30 students, attendance records, marks, and assignments

### 4. Run the Application

```bash
# Terminal 1 — Start backend
cd server
npm run dev       # Runs on http://localhost:5000

# Terminal 2 — Start frontend
cd client
npm run dev       # Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## ✨ Features

### 👥 Multi-Role System
| Role | Capabilities |
|------|-------------|
| Admin | Full access, user management, analytics |
| Teacher | Attendance, marks, assignments, reports |
| Student | View dashboard, marks, AI insights, gamification |
| Parent | Monitor child's performance, receive alerts |

### 📊 Core Modules
- **Student Management** — Add/Edit/Delete with class, section, roll number
- **Attendance System** — Manual + QR code based, percentage tracking
- **Marks Management** — Subject-wise, exam-wise, auto grade calculation

### 🤖 AI & Intelligence
- **Study Recommendations** — Detects weak subjects and suggests improvement plans
- **Predictive Analysis** — Pass/fail probability + trend analysis
- **Career Suggestions** — Recommends career paths based on strengths

### 📈 Analytics
- Real-time charts (Bar, Line, Doughnut, Radar)
- Class average comparisons
- Subject-wise performance breakdown

### 🎮 Gamification
- Points system, badges, levels
- Leaderboard across all students

### 💬 Real-time Chat
- Socket.io powered class channels
- Multiple rooms (General, Class 10-A, Announcements)

### 📄 Report Generation
- PDF report cards via jsPDF + autoTable
- Professional formatted output

### 🌐 Multi-language
- English / Tamil toggle via i18next

### 📱 PWA Ready
- Service worker manifest configured
- Works offline with cached data

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/students` | Get all students |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/stats/:id` | Student attendance stats |
| POST | `/api/attendance/generate-qr` | Generate QR code |
| POST | `/api/marks` | Enter marks |
| GET | `/api/marks/stats/:id` | Student marks stats |
| GET | `/api/analytics/overview` | Dashboard overview |
| GET | `/api/ai/recommendations/:id` | AI study tips |
| GET | `/api/ai/predict/:id` | Performance prediction |
| GET | `/api/ai/career/:id` | Career suggestions |
| GET | `/api/reports/student/:id` | Student report data |
| POST | `/api/assignments` | Create assignment |
| GET | `/api/gamification/leaderboard` | Leaderboard |
| GET | `/api/chat/:room` | Chat messages |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy /dist folder to Vercel
```

### Backend → Render
- Push server/ to GitHub
- Connect to Render, set environment variables
- Set start command: `node server.js`

### Database → MongoDB Atlas
- Create free cluster at mongodb.com
- Get connection string → set as MONGO_URI

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand (persisted) |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken) |
| Real-time | Socket.io |
| PDF | jsPDF + jspdf-autotable |
| QR Code | qrcode npm package |
| i18n | i18next + react-i18next |
| Email | Nodemailer (ready to configure) |

---

## 📝 License

MIT License — Free to use for educational and commercial purposes.

---

Built with ❤️ — EduNexus AI
