import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { attendanceService, studentService } from '../../services/api';

const CLASSES = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];
const STATUS_COLORS = { present: 'bg-emerald-100 text-emerald-700 border-emerald-200', absent: 'bg-red-100 text-red-700 border-red-200', late: 'bg-yellow-100 text-yellow-700 border-yellow-200', excused: 'bg-slate-100 text-slate-600 border-slate-200' };

export default function AttendancePage() {
  const { user } = useAuthStore();
  const isTeacher = ['admin', 'teacher'].includes(user?.role);
  const [selectedClass, setSelectedClass] = useState(user?.studentProfile?.class || user?.teacherProfile?.classes?.[0] || '10-A');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(isTeacher ? 'mark' : 'history');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isTeacher && tab === 'mark') loadStudents();
    if (!isTeacher) loadMyStats();
    loadRecords();
  }, [selectedClass, tab]);

  const loadStudents = async () => {
    setLoading(true);
    const { data } = await studentService.getByClass(selectedClass);
    setStudents(data.students || []);
    const defaultAtt = {};
    data.students?.forEach(s => { defaultAtt[s._id] = 'present'; });
    setAttendance(defaultAtt);
    setLoading(false);
  };

  const loadMyStats = async () => {
    const { data } = await attendanceService.getStats(user._id);
    setStats(data.stats);
  };

  const loadRecords = async () => {
    const params = isTeacher ? { class: selectedClass } : { student: user._id };
    const { data } = await attendanceService.getAll(params);
    setRecords(data.records?.slice(0, 30) || []);
  };

  const handleSave = async () => {
    setSaving(true);
    const recs = students.map(s => ({
      student: s._id, class: selectedClass, status: attendance[s._id] || 'absent',
    }));
    await attendanceService.mark({ records: recs });
    setSaving(false);
    alert('Attendance saved successfully!');
    loadRecords();
  };

  const generateQR = async () => {
    const { data } = await attendanceService.generateQR({ class: selectedClass });
    setQrCode(data.qrCode);
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendance(updated);
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {isTeacher && (
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field w-36">
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-fit">
        {(isTeacher ? ['mark', 'qr', 'history'] : ['history', 'stats']).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>
            {t === 'mark' ? '✅ Mark' : t === 'qr' ? '📱 QR Code' : t === 'history' ? '📋 History' : '📊 Stats'}
          </button>
        ))}
      </div>

      {/* Mark Attendance Tab */}
      {tab === 'mark' && isTeacher && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              <span className="badge badge-success">{presentCount} Present</span>
              <span className="badge badge-danger">{absentCount} Absent</span>
              <span className="badge badge-gray">{students.length} Total</span>
            </div>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => markAll('present')} className="btn-secondary text-xs">All Present</button>
              <button onClick={() => markAll('absent')} className="btn-secondary text-xs">All Absent</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-xs">{saving ? 'Saving...' : 'Save Attendance'}</button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : (
            <div className="card p-0 overflow-hidden">
              {students.map((s, i) => (
                <div key={s._id} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-slate-50 dark:border-slate-700' : ''}`}>
                  <span className="text-slate-400 text-sm w-6 text-right">{i + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.studentProfile?.rollNumber}</div>
                  </div>
                  <div className="flex gap-1.5">
                    {['present', 'absent', 'late'].map(status => (
                      <button key={status} onClick={() => setAttendance({ ...attendance, [s._id]: status })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize ${attendance[s._id] === status ? STATUS_COLORS[status] : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {students.length === 0 && <div className="p-8 text-center text-slate-400">No students in this class</div>}
            </div>
          )}
        </div>
      )}

      {/* QR Code Tab */}
      {tab === 'qr' && isTeacher && (
        <div className="card max-w-sm mx-auto text-center">
          <h3 className="font-semibold mb-4">QR Code Attendance for Class {selectedClass}</h3>
          {qrCode ? (
            <div>
              <img src={qrCode} alt="QR Code" className="mx-auto rounded-xl shadow-md" />
              <p className="text-xs text-slate-400 mt-3">Students can scan this to mark themselves present</p>
              <button onClick={generateQR} className="btn-secondary mt-3 w-full">Regenerate QR</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-8xl">📱</div>
              <p className="text-slate-500 text-sm">Generate a QR code that students can scan to mark their attendance</p>
              <button onClick={generateQR} className="btn-primary w-full">Generate QR Code</button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="table-th">Date</th>
                  {isTeacher && <th className="table-th">Student</th>}
                  <th className="table-th">Status</th>
                  <th className="table-th">Method</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={4} className="table-td text-center text-slate-400 py-12">No records found</td></tr>
                ) : records.map((r, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-td font-mono text-xs">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    {isTeacher && (
                      <td className="table-td">
                        <div className="font-medium text-sm">{r.student?.name}</div>
                        <div className="text-xs text-slate-400">{r.student?.studentProfile?.rollNumber}</div>
                      </td>
                    )}
                    <td className="table-td">
                      <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : 'badge-danger'}`}>{r.status}</span>
                    </td>
                    <td className="table-td text-slate-400 text-xs capitalize">{r.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Tab (Student) */}
      {tab === 'stats' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Days', value: stats.total, icon: '📅' },
              { label: 'Present', value: stats.present, icon: '✅' },
              { label: 'Absent', value: stats.absent, icon: '❌' },
              { label: 'Attendance %', value: `${stats.percentage}%`, icon: '📊' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className="text-2xl">{s.icon}</div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className={`card ${stats.percentage < 75 ? 'bg-red-50 border-red-200 dark:bg-red-900/20' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20'}`}>
            <p className={`font-semibold ${stats.percentage < 75 ? 'text-red-700' : 'text-emerald-700'}`}>
              {stats.percentage >= 75 ? '🎉 Your attendance is good! Keep it up.' : `⚠️ Your attendance is low (${stats.percentage}%). You need at least 75% to avoid issues.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
