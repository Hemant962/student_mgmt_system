import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';

/* ── tiny SVG icons ─────────────────────────────────────── */
const IC = {
  home:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  users:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  check:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  star:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  book:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  chart:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  chat:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  trophy:   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  ai:       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  report:   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  logout:   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

/* ── Nav items per role — ALL dashboards point to /dashboard ─ */
const NAV = {
  admin: [
    { path: '/dashboard',      label: 'Dashboard',        icon: 'home'     },
    { path: '/admin/students', label: 'Students',          icon: 'users'    },
    { path: '/attendance',     label: 'Attendance',        icon: 'check'    },
    { path: '/marks',          label: 'Marks & Grades',   icon: 'star'     },
    { path: '/assignments',    label: 'Assignments',       icon: 'book'     },
    { path: '/timetable',      label: 'Timetable',         icon: 'calendar' },
    { path: '/reports',        label: 'Reports',           icon: 'report'   },
    { path: '/ai-insights',    label: 'AI Insights',       icon: 'ai'       },
    { path: '/gamification',   label: 'Leaderboard',       icon: 'trophy'   },
    { path: '/chat',           label: 'Chat',              icon: 'chat'     },
  ],
  teacher: [
    { path: '/dashboard',      label: 'Dashboard',        icon: 'home'     },
    { path: '/admin/students', label: 'My Students',       icon: 'users'    },
    { path: '/attendance',     label: 'Attendance',        icon: 'check'    },
    { path: '/marks',          label: 'Marks & Grades',   icon: 'star'     },
    { path: '/assignments',    label: 'Assignments',       icon: 'book'     },
    { path: '/timetable',      label: 'Timetable',         icon: 'calendar' },
    { path: '/reports',        label: 'Reports',           icon: 'report'   },
    { path: '/ai-insights',    label: 'AI Insights',       icon: 'ai'       },
    { path: '/chat',           label: 'Chat',              icon: 'chat'     },
  ],
  student: [
    { path: '/dashboard',     label: 'My Dashboard',     icon: 'home'     },
    { path: '/attendance',    label: 'My Attendance',    icon: 'check'    },
    { path: '/marks',         label: 'My Marks',         icon: 'star'     },
    { path: '/assignments',   label: 'Assignments',      icon: 'book'     },
    { path: '/timetable',     label: 'Timetable',        icon: 'calendar' },
    { path: '/ai-insights',   label: 'AI Insights',      icon: 'ai'       },
    { path: '/gamification',  label: 'Leaderboard',      icon: 'trophy'   },
    { path: '/reports',       label: 'My Report',        icon: 'report'   },
    { path: '/chat',          label: 'Chat',             icon: 'chat'     },
  ],
  parent: [
    { path: '/dashboard',    label: 'Dashboard',         icon: 'home'     },
    { path: '/attendance',   label: 'Attendance',         icon: 'check'    },
    { path: '/marks',        label: 'Marks',              icon: 'star'     },
    { path: '/reports',      label: 'Reports',            icon: 'report'   },
    { path: '/ai-insights',  label: 'AI Insights',        icon: 'ai'       },
    { path: '/chat',         label: 'Chat',               icon: 'chat'     },
  ],
};

const ROLE_BADGE_COLOR = {
  admin:   'from-violet-500 to-purple-600',
  teacher: 'from-blue-500 to-cyan-500',
  student: 'from-emerald-500 to-teal-500',
  parent:  'from-orange-400 to-red-500',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const navItems = NAV[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white dark:bg-slate-800
          border-r border-slate-100 dark:border-slate-700
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
        style={{ width: 'var(--sidebar-width)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ROLE_BADGE_COLOR[user?.role] || 'from-primary-500 to-violet-600'} flex items-center justify-center shadow-md flex-shrink-0`}>
            <span className="text-white font-bold text-sm">EN</span>
          </div>
          <div className="ml-3 min-w-0">
            <div className="font-bold text-slate-800 dark:text-white text-sm leading-tight truncate">EduNexus AI</div>
            <div className="text-[11px] text-slate-400 capitalize">{user?.role} Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
              }
            >
              {IC[item.icon]}
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-1 flex-shrink-0">
          <button
            onClick={toggleLang}
            className="sidebar-item sidebar-item-inactive w-full text-left"
          >
            <span className="text-base w-5 text-center">🌐</span>
            <span>{i18n.language === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}</span>
          </button>

          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
            }
          >
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${ROLE_BADGE_COLOR[user?.role] || 'from-primary-500 to-violet-600'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="truncate">{user?.name}</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {IC.logout}
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
