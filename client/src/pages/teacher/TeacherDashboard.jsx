import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { studentService, attendanceService, marksService, assignmentService } from '../../services/api';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ students: 0, pendingAssignments: 0, todayMarked: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cls = user?.teacherProfile?.classes?.[0] || '10-A';
    Promise.all([
      studentService.getByClass(cls),
      assignmentService.getAll({ class: cls }),
    ]).then(([studRes, assignRes]) => {
      setRecentStudents(studRes.data.students?.slice(0, 6) || []);
      setStats({
        students: studRes.data.students?.length || 0,
        pendingAssignments: assignRes.data.assignments?.filter(a => a.status === 'active').length || 0,
        todayMarked: 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { label: 'Mark Attendance', path: '/attendance', icon: '✅', color: 'from-emerald-400 to-emerald-600' },
    { label: 'Enter Marks', path: '/marks', icon: '📝', color: 'from-primary-400 to-primary-600' },
    { label: 'New Assignment', path: '/assignments', icon: '📚', color: 'from-violet-400 to-violet-600' },
    { label: 'View Reports', path: '/reports', icon: '📊', color: 'from-orange-400 to-orange-600' },
    { label: 'AI Insights', path: '/ai-insights', icon: '🤖', color: 'from-pink-400 to-pink-600' },
    { label: 'Class Chat', path: '/chat', icon: '💬', color: 'from-cyan-400 to-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.name?.split(' ')[1] || user?.name}! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">
          Teaching: {user?.teacherProfile?.subjects?.join(', ') || 'All Subjects'} &nbsp;|&nbsp;
          Classes: {user?.teacherProfile?.classes?.join(', ') || 'All Classes'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'My Students', value: stats.students, icon: '👨‍🎓', bg: 'bg-primary-50 text-primary-600' },
          { label: 'Active Assignments', value: stats.pendingAssignments, icon: '📋', bg: 'bg-violet-50 text-violet-600' },
          { label: 'Classes Today', value: user?.teacherProfile?.classes?.length || 2, icon: '🏫', bg: 'bg-emerald-50 text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className={`text-3xl font-bold mb-1`}>{s.value}</div>
            <div className="text-slate-500 text-sm flex items-center gap-1">{s.icon} {s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.path}
              className={`bg-gradient-to-br ${a.color} rounded-2xl p-5 text-white hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <div className="font-semibold text-sm">{a.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* My Students */}
      {recentStudents.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">My Students</h2>
            <Link to="/admin/students" className="text-primary-500 text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recentStudents.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.studentProfile?.rollNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's schedule reminder */}
      <div className="card bg-gradient-to-br from-primary-500 to-violet-600 text-white border-0">
        <h3 className="font-semibold mb-3">📅 Today's Reminder</h3>
        <ul className="space-y-1.5 text-sm text-white/90">
          <li>• Mark attendance for all your classes</li>
          <li>• Check pending assignment submissions</li>
          <li>• Review AI insights for struggling students</li>
        </ul>
      </div>
    </div>
  );
}
