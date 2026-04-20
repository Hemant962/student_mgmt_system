import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { attendanceService, marksService, aiService, gamificationService } from '../../services/api';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);


export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [attStats, setAttStats] = useState(null);
  const [marksStats, setMarksStats] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([
      attendanceService.getStats(user._id),
      marksService.getStats(user._id),
      gamificationService.getProfile(user._id),
      aiService.getPrediction(user._id),
    ]).then(([a, m, g, p]) => {
      setAttStats(a.data.stats);
      setMarksStats(m.data.stats);
      setGamification(g.data.gamification);
      setPrediction(p.data.prediction);
    }).finally(() => setLoading(false));
  }, [user]);

  const radarData = {
    labels: marksStats?.subjectAverages?.map(s => s.subject.slice(0, 4)) || [],
    datasets: [{
      label: 'Your Score',
      data: marksStats?.subjectAverages?.map(s => s.average) || [],
      backgroundColor: 'rgba(26, 75, 255, 0.15)',
      borderColor: '#1a4bff',
      borderWidth: 2,
      pointBackgroundColor: '#1a4bff',
    }],
  };

  if (loading) return (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card bg-gradient-to-br from-primary-500 to-violet-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.name} 👋</h1>
            <p className="text-white/70 text-sm mt-1">Class {user?.studentProfile?.class} | Roll: {user?.studentProfile?.rollNumber}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{gamification?.level || 1}</div>
            <div className="text-white/70 text-xs">Level</div>
            <div className="text-white font-semibold">{gamification?.points || 0} pts</div>
          </div>
        </div>
        {gamification?.pointsToNextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Progress to Level {(gamification.level || 1) + 1}</span>
              <span>{100 - gamification.pointsToNextLevel}/100 pts</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${100 - gamification.pointsToNextLevel}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: `${attStats?.percentage || 0}%`, icon: '✅', color: attStats?.percentage >= 75 ? 'text-emerald-600' : 'text-red-500', bg: 'bg-emerald-50' },
          { label: 'Overall Average', value: `${marksStats?.overallAvg || 0}%`, icon: '📊', color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Pass Probability', value: `${prediction?.passProbability || 0}%`, icon: '🎯', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Badges Earned', value: gamification?.badges?.length || 0, icon: '🏅', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((s) => (
          <div key={s.label} className={`card ${s.bg} border-0`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.icon} {s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts + Prediction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {marksStats?.subjectAverages?.length > 0 && (
          <div className="card">
            <h3 className="section-title">Subject Performance</h3>
            <div className="h-56">
              <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 10 } } } }, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="section-title">AI Performance Prediction</h3>
          {prediction ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div>
                  <div className="text-sm text-slate-500">Pass Probability</div>
                  <div className={`text-3xl font-bold ${prediction.passProbability >= 60 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {prediction.passProbability}%
                  </div>
                </div>
                <div className={`text-4xl`}>{prediction.passProbability >= 75 ? '🟢' : prediction.passProbability >= 50 ? '🟡' : '🔴'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Trend:</span>
                <span className={`badge ${prediction.trend === 'improving' ? 'badge-success' : prediction.trend === 'declining' ? 'badge-danger' : 'badge-warning'}`}>
                  {prediction.trend === 'improving' ? '📈 Improving' : prediction.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                </span>
              </div>
              {prediction.forecast?.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2">Predicted next 3 exams:</div>
                  <div className="flex gap-2">
                    {prediction.forecast.map((f, i) => (
                      <div key={i} className="flex-1 text-center p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                        <div className="text-lg font-bold text-primary-600">{f}%</div>
                        <div className="text-xs text-slate-400">Exam {i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : <p className="text-slate-400 text-sm">Not enough data yet</p>}
        </div>
      </div>

      {/* Weak subjects + badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {marksStats?.weakSubjects?.length > 0 && (
          <div className="card border-l-4 border-l-red-400">
            <h3 className="section-title text-red-600">⚠️ Needs Improvement</h3>
            <div className="space-y-2">
              {marksStats.weakSubjects.map((s) => (
                <div key={s.subject} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <span className="text-sm font-medium">{s.subject}</span>
                  <span className="badge badge-danger">{s.average}% avg</span>
                </div>
              ))}
            </div>
            <Link to="/ai-insights" className="mt-3 block text-center text-primary-500 text-sm font-medium hover:underline">
              Get AI Study Tips →
            </Link>
          </div>
        )}

        {gamification?.badges?.length > 0 && (
          <div className="card">
            <h3 className="section-title">🏅 My Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {gamification.badges.map((b) => (
                <div key={b.id} className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100">
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Attendance', path: '/attendance', icon: '📅' },
          { label: 'My Marks', path: '/marks', icon: '📝' },
          { label: 'Assignments', path: '/assignments', icon: '📚' },
          { label: 'Leaderboard', path: '/gamification', icon: '🏆' },
        ].map((l) => (
          <Link key={l.label} to={l.path} className="card text-center hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
            <div className="text-3xl mb-1">{l.icon}</div>
            <div className="text-sm font-medium">{l.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
