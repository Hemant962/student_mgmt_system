import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const DEMO_ACCOUNTS = [
  { role: 'Admin',   email: 'admin@school.com',    password: 'admin123',   icon: '👑', grad: 'from-violet-500 to-purple-700' },
  { role: 'Teacher', email: 'priya@school.com',    password: 'teacher123', icon: '👩‍🏫', grad: 'from-blue-500 to-cyan-600'   },
  { role: 'Student', email: 'student1@school.com', password: 'student123', icon: '👨‍🎓', grad: 'from-emerald-500 to-teal-600' },
  { role: 'Parent',  email: 'parent@school.com',   password: 'parent123',  icon: '👨‍👩‍👦', grad: 'from-orange-500 to-red-500'  },
];

const ROLE_HOME = { admin: '/admin', teacher: '/teacher', student: '/student', parent: '/parent' };

export default function Login() {
  const [email, setEmail]       = useState('admin@school.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError]       = useState('');

  const { login, isLoading, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(ROLE_HOME[user.role] || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email.trim(), password);
    if (res.success && res.user?.role) {
      navigate(ROLE_HOME[res.user.role] || '/dashboard', { replace: true });
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 shadow-2xl shadow-primary-900/50 mb-4">
            <span className="text-white font-bold text-2xl">EN</span>
          </div>
          <h1 className="text-3xl font-bold text-white">EduNexus <span className="text-primary-400">AI</span></h1>
          <p className="text-slate-400 text-sm mt-1">NextGen Student Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-1">Sign in to your account</h2>
          <p className="text-slate-400 text-sm mb-6">Enter your credentials or pick a demo role below</p>

          {error && (
            <div className="mb-5 flex items-center gap-2 p-3.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                placeholder="you@school.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-400 hover:to-violet-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary-900/40"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Demo quick-login */}
          <div className="mt-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-500 text-xs font-medium">QUICK DEMO LOGIN</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left"
                >
                  <span className="text-xl">{acc.icon}</span>
                  <div className="min-w-0">
                    <div className="text-white text-xs font-bold">{acc.role}</div>
                    <div className="text-slate-500 text-[10px] truncate">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Run <code className="bg-white/5 px-1 rounded text-slate-400">npm run seed</code> in /server to create demo users
        </p>
      </div>
    </div>
  );
}
