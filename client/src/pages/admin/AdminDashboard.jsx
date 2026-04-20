import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, studentService } from '../../services/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';


const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="stat-card animate-in">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div>
      <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getOverview().then(r => {
      setOverview(r.data.overview);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
    },
  };

  const attendanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{
      label: 'Attendance %',
      data: [88, 92, 85, 90, 87],
      backgroundColor: 'rgba(26, 75, 255, 0.15)',
      borderColor: '#1a4bff',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1a4bff',
      pointRadius: 4,
    }],
  };

  const marksChartData = {
    labels: ['Math', 'Science', 'English', 'History', 'CS', 'Tamil'],
    datasets: [{
      label: 'Class Average',
      data: [72, 68, 80, 75, 85, 70],
      backgroundColor: ['#1a4bff','#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444'].map(c => c + '90'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const roleDistribution = {
    labels: ['Students', 'Teachers', 'Parents'],
    datasets: [{
      data: [overview?.totalStudents || 150, overview?.totalTeachers || 12, 80],
      backgroundColor: ['#1a4bff', '#7c3aed', '#10b981'],
      borderWidth: 0,
    }],
  };

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-sm text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={overview?.totalStudents || 150} color="bg-primary-500"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          sub="+5 this month" />
        <StatCard label="Total Teachers" value={overview?.totalTeachers || 12} color="bg-violet-500"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          sub="Active faculty" />
        <StatCard label="Today's Attendance" value={`${overview?.avgAttendance || 88}%`} color="bg-emerald-500"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          sub={`${overview?.todayPresent || 132} present`} />
        <StatCard label="Active Assignments" value="8" color="bg-orange-500"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          sub="3 due this week" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance trend */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Weekly Attendance Trend</h3>
            <span className="badge badge-success">This Week</span>
          </div>
          <div className="chart-container">
            <Line data={attendanceChartData} options={chartOptions} />
          </div>
        </div>

        {/* Role distribution */}
        <div className="card">
          <h3 className="section-title">User Distribution</h3>
          <div className="h-48 flex items-center justify-center">
            <Doughnut data={roleDistribution} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }, cutout: '70%' }} />
          </div>
        </div>
      </div>

      {/* Subject performance */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Subject-wise Class Average</h3>
          <Link to="/marks" className="text-primary-500 text-sm font-medium hover:underline">View All</Link>
        </div>
        <div className="chart-container">
          <Bar data={marksChartData} options={chartOptions} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Student', path: '/admin/students', icon: '➕', color: 'bg-primary-50 text-primary-600 hover:bg-primary-100' },
          { label: 'Mark Attendance', path: '/attendance', icon: '✅', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
          { label: 'Enter Marks', path: '/marks', icon: '📝', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
          { label: 'Generate Report', path: '/reports', icon: '📊', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
        ].map((a) => (
          <Link key={a.label} to={a.path} className={`card text-center p-4 cursor-pointer transition-all hover:shadow-md ${a.color}`}>
            <div className="text-3xl mb-2">{a.icon}</div>
            <div className="text-sm font-semibold">{a.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      {overview?.recentMarks?.length > 0 && (
        <div className="card">
          <h3 className="section-title">Recent Marks Entry</h3>
          <div className="space-y-2">
            {overview.recentMarks.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                    {m.student?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.student?.name}</div>
                    <div className="text-xs text-slate-400">{m.subject} — {m.examName}</div>
                  </div>
                </div>
                <span className={`badge ${m.grade === 'A+' || m.grade === 'A' ? 'badge-success' : m.grade === 'F' ? 'badge-danger' : 'badge-info'}`}>
                  {m.marksObtained}/{m.maxMarks} ({m.grade})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
