import React, { useEffect, useState } from 'react';
import { studentService } from '../../services/api';

const CLASSES = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', studentProfile: { class: '10-A', section: 'A', rollNumber: '' } });
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterClass) params.class = filterClass;
      const { data } = await studentService.getAll(params);
      setStudents(data.students);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search, filterClass]);

  const openAdd = () => {
    setEditStudent(null);
    setForm({ name: '', email: '', phone: '', studentProfile: { class: '10-A', section: 'A', rollNumber: '' } });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setForm({ name: s.name, email: s.email, phone: s.phone || '', studentProfile: s.studentProfile || { class: '', section: '', rollNumber: '' } });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editStudent) {
        await studentService.update(editStudent._id, form);
      } else {
        await studentService.create({ ...form, password: 'student123' });
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) { alert(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    await studentService.delete(id);
    fetchStudents();
  };

  const grades = (s) => s.studentProfile?.class || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="text-slate-500 text-sm mt-1">{students.length} students registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search students..."
          className="input-field flex-1 min-w-[200px]"
        />
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="input-field w-40">
          <option value="">All Classes</option>
          {CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="table-th">Student</th>
                <th className="table-th">Class</th>
                <th className="table-th">Roll No.</th>
                <th className="table-th">Email</th>
                <th className="table-th">Points</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="table-td"><div className="skeleton h-4 w-24 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="table-td text-center text-slate-400 py-12">No students found</td></tr>
              ) : students.map((s) => (
                <tr key={s._id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-white">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.phone || 'No phone'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td"><span className="badge badge-info">{grades(s)}</span></td>
                  <td className="table-td font-mono text-xs">{s.studentProfile?.rollNumber || '—'}</td>
                  <td className="table-td text-slate-500">{s.email}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{s.studentProfile?.points || 0}</span>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="text-primary-500 hover:text-primary-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in">
            <h2 className="text-lg font-bold mb-5">{editStudent ? 'Edit Student' : 'Add New Student'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Student name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@school.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Class</label>
                  <select className="input-field" value={form.studentProfile.class} onChange={e => setForm({ ...form, studentProfile: { ...form.studentProfile, class: e.target.value } })}>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Roll Number</label>
                  <input className="input-field" value={form.studentProfile.rollNumber} onChange={e => setForm({ ...form, studentProfile: { ...form.studentProfile, rollNumber: e.target.value } })} placeholder="Roll No." />
                </div>
              </div>
              {!editStudent && <p className="text-xs text-slate-400">Default password: <code className="bg-slate-100 px-1 rounded">student123</code></p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Student'}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
