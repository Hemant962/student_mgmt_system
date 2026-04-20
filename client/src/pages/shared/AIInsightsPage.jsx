import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { aiService, studentService } from '../../services/api';

export default function AIInsightsPage() {
  const { user } = useAuthStore();
  const isTeacher = ['admin', 'teacher'].includes(user?.role);
  const [studentId, setStudentId] = useState(isTeacher ? '' : user._id);
  const [students, setStudents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('recommendations');

  useEffect(() => {
    if (isTeacher) {
      studentService.getAll({ limit: 50 }).then(r => setStudents(r.data.students || []));
    } else {
      loadAll(user._id);
    }
  }, []);

  const loadAll = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const [r, p, c] = await Promise.all([
        aiService.getRecommendations(id),
        aiService.getPrediction(id),
        aiService.getCareerSuggestions(id),
      ]);
      setRecommendations(r.data.recommendations || []);
      setPrediction(p.data.prediction);
      setCareers(c.data.suggestions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const TABS = [
    { id: 'recommendations', label: '📋 Study Tips', icon: '📋' },
    { id: 'prediction', label: '🎯 Prediction', icon: '🎯' },
    { id: 'career', label: '🚀 Career', icon: '🚀' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">🤖 AI Insights</h1>
        <p className="text-slate-500 text-sm mt-1">Powered by intelligent analysis of academic performance</p>
      </div>

      {isTeacher && (
        <div className="card flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-600 mb-1">Select Student</label>
            <select className="input-field" value={studentId} onChange={e => { setStudentId(e.target.value); loadAll(e.target.value); }}>
              <option value="">Choose a student...</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentProfile?.class})</option>)}
            </select>
          </div>
        </div>
      )}

      {!studentId && isTeacher && (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">Select a Student</h3>
          <p className="text-slate-400 text-sm">Choose a student above to view their AI-powered insights</p>
        </div>
      )}

      {(studentId || !isTeacher) && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-fit">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          )}

          {/* Recommendations */}
          {!loading && tab === 'recommendations' && (
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-slate-500">Great performance! No critical improvements needed.</p>
                </div>
              ) : recommendations.map((r, i) => (
                <div key={i} className={`card border-l-4 ${r.priority === 'high' ? 'border-l-red-400' : r.type === 'attendance' ? 'border-l-orange-400' : 'border-l-yellow-400'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{r.type === 'attendance' ? '📅' : r.priority === 'high' ? '🚨' : '⚠️'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{r.subject}</h3>
                        <span className={`badge ${r.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{r.priority} priority</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{r.suggestion}</p>
                      {r.resources?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-2">RESOURCES:</div>
                          <div className="flex flex-wrap gap-2">
                            {r.resources.map((res, j) => (
                              <span key={j} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">📖 {res}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prediction */}
          {!loading && tab === 'prediction' && prediction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card text-center col-span-1 md:col-span-1">
                  <div className="text-6xl font-bold mb-2" style={{ color: prediction.passProbability >= 60 ? '#22c55e' : '#ef4444' }}>
                    {prediction.passProbability}%
                  </div>
                  <div className="text-slate-500 text-sm">Pass Probability</div>
                  <div className="mt-3">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${prediction.passProbability}%`, background: prediction.passProbability >= 60 ? '#22c55e' : '#ef4444' }} />
                    </div>
                  </div>
                </div>
                <div className="card col-span-1 md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="text-sm text-slate-600">Current Average</span>
                    <span className="font-bold text-lg">{prediction.currentAvg}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="text-sm text-slate-600">Performance Trend</span>
                    <span className={`badge ${prediction.trend === 'improving' ? 'badge-success' : prediction.trend === 'declining' ? 'badge-danger' : 'badge-warning'}`}>
                      {prediction.trend === 'improving' ? '📈 Improving' : prediction.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <span className="text-sm text-slate-600">Attendance</span>
                    <span className={`font-bold ${prediction.attPct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{prediction.attPct}%</span>
                  </div>
                </div>
              </div>

              {prediction.forecast?.length > 0 && (
                <div className="card">
                  <h3 className="section-title">📈 Predicted Next 3 Exam Scores</h3>
                  <div className="flex gap-4">
                    {prediction.forecast.map((f, i) => (
                      <div key={i} className="flex-1 text-center p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20 border border-primary-100 dark:border-primary-800">
                        <div className="text-3xl font-bold text-primary-600">{f}%</div>
                        <div className="text-xs text-slate-400 mt-1">Exam {i + 1}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-3 text-center">* Predictions based on current performance trend</p>
                </div>
              )}
            </div>
          )}

          {/* Career suggestions */}
          {!loading && tab === 'career' && (
            <div className="space-y-4">
              <div className="card bg-gradient-to-br from-violet-500 to-primary-600 text-white border-0">
                <h3 className="font-semibold mb-1">🚀 Career Path Analysis</h3>
                <p className="text-white/80 text-sm">Based on academic strengths and performance patterns</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careers.map((c, i) => (
                  <div key={i} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">{c.career}</div>
                        <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-2xl font-bold text-primary-500">{c.match}%</div>
                        <div className="text-xs text-slate-400">match</div>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all" style={{ width: `${c.match}%` }} />
                    </div>
                    {i === 0 && <div className="mt-2 text-xs text-emerald-600 font-medium">⭐ Best Match</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
