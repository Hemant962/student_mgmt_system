// ProfilePage.jsx
import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services/api';

function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile(form);
      updateUser(form);
      setMsg('Profile updated successfully!');
    } catch { setMsg('Failed to update profile'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handlePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return alert('Passwords do not match');
    if (pwForm.newPassword.length < 6) return alert('Minimum 6 characters');
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const roleColors = { admin: 'from-violet-500 to-purple-600', teacher: 'from-primary-500 to-blue-600', student: 'from-emerald-500 to-teal-600', parent: 'from-orange-500 to-red-500' };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">My Profile</h1>

      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{msg}</div>}

      {/* Avatar card */}
      <div className={`card bg-gradient-to-br ${roleColors[user?.role]} text-white border-0`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div className="text-xl font-bold">{user?.name}</div>
            <div className="text-white/80 capitalize">{user?.role} Account</div>
            <div className="text-white/70 text-sm">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card space-y-4">
        <h3 className="section-title">Personal Information</h3>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
          <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
        <input className="input-field opacity-60 cursor-not-allowed" value={user?.email} disabled />

        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
          <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
        </div>
        {user?.studentProfile && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Class</label>
              <input className="input-field opacity-60 cursor-not-allowed" value={user.studentProfile.class || '—'} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Roll Number</label>
              <input className="input-field opacity-60 cursor-not-allowed" value={user.studentProfile.rollNumber || '—'} disabled />
            </div>
          </div>
        )}
        <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Update Profile'}</button>
      </div>

      {/* Change password */}
      <div className="card space-y-4">
        <h3 className="section-title">Change Password</h3>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Current Password</label>
          <input type="password" className="input-field" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
          <input type="password" className="input-field" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Confirm New Password</label>
          <input type="password" className="input-field" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
        </div>
        <button onClick={handlePassword} className="btn-primary">Change Password</button>
      </div>
    </div>
  );
}

export default ProfilePage;
