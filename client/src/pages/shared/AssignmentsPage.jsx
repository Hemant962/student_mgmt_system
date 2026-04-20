import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { assignmentService } from '../../services/api';

const CLASSES = ['10-A', '10-B', '11-A', '11-B'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Tamil'];

export default function AssignmentsPage() {
  const { user } = useAuthStore();
  const isTeacher = ['admin', 'teacher'].includes(user?.role);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: 'Mathematics', class: '10-A', dueDate: '', maxMarks: 100 });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const params = user?.studentProfile?.class ? { class: user.studentProfile.class } : {};
    const { data } = await assignmentService.getAll(params);
    setAssignments(data.assignments || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    await assignmentService.create(form);
    setShowModal(false);
    setSaving(false);
    fetch();
  };

  const handleSubmit = async (id) => {
    if (!window.confirm('Submit this assignment?')) return;
    await assignmentService.submit(id, { files: [] });
    fetch();
    alert('Assignment submitted!');
  };

  const isOverdue = (date) => new Date(date) < new Date();
  const getDueBadge = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return <span className="badge badge-danger">Overdue</span>;
    if (diff === 0) return <span className="badge badge-warning">Due Today</span>;
    if (diff <= 3) return <span className="badge badge-warning">Due in {diff}d</span>;
    return <span className="badge badge-info">Due in {diff}d</span>;
  };

  const hasSubmitted = (assignment) =>
    assignment.submissions?.some(s => s.student === user._id || s.student?._id === user._id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="text-slate-500 text-sm mt-1">{assignments.length} assignments</p>
        </div>
        {isTeacher && (
          <button onClick={() => setShowModal(true)} className="btn-primary">+ New Assignment</button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : assignments.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-slate-500">No assignments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a._id} className={`card hover:shadow-md transition-shadow ${isOverdue(a.dueDate) && !hasSubmitted(a) ? 'border-l-4 border-l-red-400' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white">{a.title}</h3>
                    {getDueBadge(a.dueDate)}
                    {hasSubmitted(a) && <span className="badge badge-success">✓ Submitted</span>}
                  </div>
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2">{a.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>📚 {a.subject}</span>
                    <span>🏫 Class {a.class}</span>
                    <span>📅 Due: {new Date(a.dueDate).toLocaleDateString('en-IN')}</span>
                    <span>⭐ Max: {a.maxMarks} marks</span>
                    <span>📋 {a.submissions?.length || 0} submissions</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!isTeacher && !hasSubmitted(a) && (
                    <button onClick={() => handleSubmit(a._id)} disabled={isOverdue(a.dueDate)} className="btn-primary text-xs whitespace-nowrap disabled:opacity-50">
                      Submit
                    </button>
                  )}
                  {isTeacher && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-500">{a.submissions?.length || 0}</div>
                      <div className="text-xs text-slate-400">Submissions</div>
                    </div>
                  )}
                </div>
              </div>

              {isTeacher && a.submissions?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Recent Submissions:</div>
                  <div className="flex flex-wrap gap-2">
                    {a.submissions.slice(0, 5).map((sub, i) => (
                      <span key={i} className={`badge ${sub.status === 'graded' ? 'badge-success' : sub.status === 'late' ? 'badge-warning' : 'badge-info'}`}>
                        {sub.status}
                      </span>
                    ))}
                    {a.submissions.length > 5 && <span className="badge badge-gray">+{a.submissions.length - 5} more</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in">
            <h2 className="text-lg font-bold mb-5">Create Assignment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Instructions..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
                  <select className="input-field" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Class</label>
                  <select className="input-field" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Due Date</label>
                  <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Max Marks</label>
                  <input type="number" className="input-field" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Assignment'}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
