import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { attendanceService, marksService, aiService } from '../../services/api';

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const childId = user?.studentProfile?.parentId || null;

  const [attStats, setAttStats] = useState(null);
  const [marksStats, setMarksStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // For demo, use a static student ID or the linked child
    const id = childId || user?._id;
    if (!id) return;
    Promise.all([
      attendanceService.getStats(id),
      marksService.getStats(id),
      aiService.getRecommendations(id),
    ]).then(([a, m, r]) => {
      setAttStats(a.data.stats);
      setMarksStats(m.data.stats);
      setRecommendations(r.data.recommendations || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Parent Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Monitoring your child's academic progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: `${attStats?.percentage || 0}%`, icon: '📅', alert: attStats?.percentage < 75 },
          { label: 'Overall Average', value: `${marksStats?.overallAvg || 0}%`, icon: '📊', alert: marksStats?.overallAvg < 50 },
          { label: 'Days Present', value: attStats?.present || 0, icon: '✅', alert: false },
          { label: 'Weak Subjects', value: marksStats?.weakSubjects?.length || 0, icon: '⚠️', alert: marksStats?.weakSubjects?.length > 0 },
        ].map((s) => (
          <div key={s.label} className={`card ${s.alert ? 'border-l-4 border-l-red-400' : ''}`}>
            <div className={`text-2xl font-bold ${s.alert ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.icon} {s.label}</div>
          </div>
        ))}
      </div>

      {attStats?.percentage < 75 && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">Low Attendance Alert</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Your child's attendance is at {attStats?.percentage}%, which is below the required 75%. 
                Please ensure regular attendance to avoid academic issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="card">
          <h3 className="section-title">🤖 AI Study Recommendations</h3>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((r, i) => (
              <div key={i} className={`p-4 rounded-xl border ${r.priority === 'high' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{r.subject}</span>
                  <span className={`badge ${r.priority === 'high' ? 'badge-danger' : 'badge-info'}`}>{r.priority} priority</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{r.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link to="/attendance" className="card hover:shadow-md transition-all text-center">
          <div className="text-3xl mb-2">📅</div>
          <div className="font-semibold text-sm">View Attendance</div>
        </Link>
        <Link to="/marks" className="card hover:shadow-md transition-all text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="font-semibold text-sm">View Marks</div>
        </Link>
        <Link to="/reports" className="card hover:shadow-md transition-all text-center">
          <div className="text-3xl mb-2">📄</div>
          <div className="font-semibold text-sm">Download Report</div>
        </Link>
        <Link to="/ai-insights" className="card hover:shadow-md transition-all text-center">
          <div className="text-3xl mb-2">🤖</div>
          <div className="font-semibold text-sm">AI Insights</div>
        </Link>
      </div>
    </div>
  );
}
