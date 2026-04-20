import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

import AdminDashboard    from './pages/admin/AdminDashboard';
import TeacherDashboard  from './pages/teacher/TeacherDashboard';
import StudentDashboard  from './pages/student/StudentDashboard';
import ParentDashboard   from './pages/parent/ParentDashboard';
import StudentsPage      from './pages/admin/StudentsPage';
import AttendancePage    from './pages/shared/AttendancePage';
import MarksPage         from './pages/shared/MarksPage';
import AssignmentsPage   from './pages/shared/AssignmentsPage';
import ReportsPage       from './pages/shared/ReportsPage';
import ChatPage          from './pages/shared/ChatPage';
import TimetablePage     from './pages/shared/TimetablePage';
import AIInsightsPage    from './pages/shared/AIInsightsPage';
import GamificationPage  from './pages/shared/GamificationPage';
import ProfilePage       from './pages/shared/ProfilePage';
import NotificationsPage from './pages/shared/NotificationsPage';

function RoleDashboard() {
  const { user } = useAuthStore();
  switch (user?.role) {
    case 'admin':   return <AdminDashboard />;
    case 'teacher': return <TeacherDashboard />;
    case 'student': return <StudentDashboard />;
    case 'parent':  return <ParentDashboard />;
    default:        return <Navigate to="/login" replace />;
  }
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireRole({ roles, children }) {
  const { user } = useAuthStore();
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLoader({ children }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold">EN</span>
        </div>
        <p className="text-sm text-slate-400">Loading EduNexus…</p>
      </div>
    </div>
  );
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLoader>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index              element={<RoleDashboard />} />
            <Route path="dashboard"  element={<RoleDashboard />} />

            <Route path="admin"          element={<RequireRole roles={['admin']}><AdminDashboard /></RequireRole>} />
            <Route path="admin/students" element={<RequireRole roles={['admin','teacher']}><StudentsPage /></RequireRole>} />
            <Route path="teacher"        element={<RequireRole roles={['teacher']}><TeacherDashboard /></RequireRole>} />
            <Route path="student"        element={<RequireRole roles={['student']}><StudentDashboard /></RequireRole>} />
            <Route path="parent"         element={<RequireRole roles={['parent']}><ParentDashboard /></RequireRole>} />

            <Route path="attendance"    element={<AttendancePage />} />
            <Route path="marks"         element={<MarksPage />} />
            <Route path="assignments"   element={<AssignmentsPage />} />
            <Route path="reports"       element={<ReportsPage />} />
            <Route path="chat"          element={<ChatPage />} />
            <Route path="timetable"     element={<TimetablePage />} />
            <Route path="ai-insights"   element={<AIInsightsPage />} />
            <Route path="gamification"  element={<GamificationPage />} />
            <Route path="profile"       element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLoader>
    </BrowserRouter>
  );
}
