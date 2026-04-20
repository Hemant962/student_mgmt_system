import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/api';

const TYPE_ICONS = { attendance: '📅', marks: '📝', assignment: '📚', exam: '📋', general: '🔔', alert: '🚨' };
const TYPE_COLORS = { attendance: 'bg-blue-50 border-blue-200', marks: 'bg-violet-50 border-violet-200', assignment: 'bg-orange-50 border-orange-200', alert: 'bg-red-50 border-red-200', general: 'bg-slate-50 border-slate-200', exam: 'bg-emerald-50 border-emerald-200' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    notificationService.getAll().then(r => {
      setNotifications(r.data.notifications || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = async (id) => {
    await notificationService.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          {unread > 0 && <p className="text-slate-500 text-sm mt-1">{unread} unread notifications</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-xs">Mark All Read</button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">All Caught Up!</h3>
          <p className="text-slate-400 text-sm">No notifications to show</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`relative card border transition-all ${!n.isRead ? TYPE_COLORS[n.type] || TYPE_COLORS.general : 'border-slate-100 dark:border-slate-700 opacity-70'}`}>
              {!n.isRead && <div className="absolute top-4 right-4 w-2 h-2 bg-primary-500 rounded-full" />}
              <div className="flex items-start gap-3 pr-6">
                <span className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{n.title}</div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)} className="text-xs text-primary-500 hover:underline">Mark read</button>
                    )}
                    <button onClick={() => deleteNotif(n._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
