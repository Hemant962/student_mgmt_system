import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { marksService, studentService } from '../../services/api';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Tamil'];
const EXAM_TYPES = ['unit_test', 'midterm', 'final', 'assignment', 'practical'];
const CLASSES = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];
const GRADE_COLORS = { 'A+': 'badge-success', A: 'badge-success', 'B+': 'badge-info', B: 'badge-info', C: 'badge-warning', D: 'badge-warning', F: 'badge-danger' };

export default function MarksPage() {
  const { user } = useAuthStore();
  const isTeacher = ['admin', 'teacher'].includes(user?.role);
  const [marks, setMarks] = useState([]);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(user?.studentProfile?.class || '10-A');
  const [tab, setTab] = useState(isTeacher ? 'entry' : 'mymarks');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student: '', subject: 'Mathematics', examName: '', examType: 'unit_test', marksObtained: '', maxMarks: 100 });

  const fetchMarks = async () => {
    setLoading(true);
    const params = isTeacher ? { class: selectedClass } : { student: user._id };
    const { data } = await marksService.getAll(params);
    setMarks(data.marks || []);
    setLoading(false);
  };

  const fetchStats = async () => {
    const id = user._id;
    const { data } = await marksService.getStats(id);
    setStats(data.stats);
  };

  const fetchStudents = async () => {
    const { data } = await studentService.getByClass(selectedClass);
    setStudents(data.students || []);
  };

  useEffect(() => {
    fetchMarks();
    if (!isTeacher) fetchStats();
    if (isTeacher) fetchStudents();
  }, [selectedClass, tab]);

  const handleSave = async () => {
    if (!form.student || !form.marksObtained) return alert('Fill all fields');
    await marksService.create({ entries: [{ ...form, class: selectedClass, marksObtained: Number(form.marksObtained), maxMarks: Number(form.maxMarks) }] });
    setShowModal(false);
    fetchMarks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mark?')) return;
    await marksService.delete(id);
    fetchMarks();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Marks & Grades</h1>
          <p className="text-slate-500 text-sm mt-1">{isTeacher ? 'Manage student marks and grades' : 'Your academic performance'}</p>
        </div>
        <div className="flex gap-2">
          {isTeacher && (
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field w-36">
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          )}
          {isTeacher && (
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Marks</button>
          )}
        </div>
      </div>

      {/* Stats for students */}
      {!isTeacher && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall Average', value: `${stats.overallAvg}%`, color: 'text-primary-600' },
            { label: 'Total Exams', value: stats.totalExams, color: 'text-violet-600' },
            { label: 'Strong Subjects', value: stats.subjectAverages?.filter(s => s.average >= 80).length || 0, color: 'text-emerald-600' },
            { label: 'Weak Subjects', value: stats.weakSubjects?.length || 0, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="card">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Subject-wise averages (student) */}
      {!isTeacher && stats?.subjectAverages?.length > 0 && (
        <div className="card">
          <h3 className="section-title">Subject-wise Performance</h3>
          <div className="space-y-3">
            {stats.subjectAverages.map((s) => (
              <div key={s.subject} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium truncate">{s.subject}</div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-full rounded-full transition-all ${s.average >= 80 ? 'bg-emerald-500' : s.average >= 60 ? 'bg-primary-500' : 'bg-red-500'}`}
                    style={{ width: `${s.average}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-semibold">{s.average}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marks table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold">{isTeacher ? `Marks — Class ${selectedClass}` : 'My Mark Sheet'}</h3>
          <span className="badge badge-gray">{marks.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {isTeacher && <th className="table-th">Student</th>}
                <th className="table-th">Subject</th>
                <th className="table-th">Exam</th>
                <th className="table-th">Marks</th>
                <th className="table-th">Grade</th>
                {isTeacher && <th className="table-th">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(isTeacher ? 6 : 4)].map((_, j) => <td key={j} className="table-td"><div className="skeleton h-4 w-20 rounded" /></td>)}</tr>
                ))
              ) : marks.length === 0 ? (
                <tr><td colSpan={6} className="table-td text-center text-slate-400 py-12">No marks recorded yet</td></tr>
              ) : marks.map((m) => (
                <tr key={m._id} className="table-row">
                  {isTeacher && (
                    <td className="table-td">
                      <div className="font-medium text-sm">{m.student?.name}</div>
                      <div className="text-xs text-slate-400">{m.student?.studentProfile?.rollNumber}</div>
                    </td>
                  )}
                  <td className="table-td font-medium">{m.subject}</td>
                  <td className="table-td">
                    <div className="text-sm">{m.examName}</div>
                    <div className="text-xs text-slate-400 capitalize">{m.examType?.replace('_', ' ')}</div>
                  </td>
                  <td className="table-td">
                    <span className="font-semibold">{m.marksObtained}</span>
                    <span className="text-slate-400">/{m.maxMarks}</span>
                    <span className="text-xs text-slate-400 ml-1">({Math.round((m.marksObtained/m.maxMarks)*100)}%)</span>
                  </td>
                  <td className="table-td"><span className={`badge ${GRADE_COLORS[m.grade] || 'badge-gray'}`}>{m.grade}</span></td>
                  {isTeacher && (
                    <td className="table-td">
                      <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Marks Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in">
            <h2 className="text-lg font-bold mb-5">Add Marks</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Student</label>
                <select className="input-field" value={form.student} onChange={e => setForm({ ...form, student: e.target.value })}>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentProfile?.rollNumber})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
                  <select className="input-field" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Exam Type</label>
                  <select className="input-field" value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })}>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Exam Name</label>
                <input className="input-field" value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })} placeholder="e.g. Unit Test 1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Marks Obtained</label>
                  <input className="input-field" type="number" min="0" value={form.marksObtained} onChange={e => setForm({ ...form, marksObtained: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Max Marks</label>
                  <input className="input-field" type="number" min="1" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="btn-primary flex-1">Save Marks</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
