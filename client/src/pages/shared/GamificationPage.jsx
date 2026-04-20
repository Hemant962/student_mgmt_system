// GamificationPage.jsx
import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { gamificationService } from '../../services/api';

function GamificationPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      gamificationService.getLeaderboard(),
      gamificationService.getProfile(user._id),
    ]).then(([l, p]) => {
      setLeaderboard(l.data.leaderboard || []);
      setMyProfile(p.data.gamification);
    }).finally(() => setLoading(false));
  }, []);

  const rankBg = (r) => r === 1 ? 'bg-yellow-100 border-yellow-300' : r === 2 ? 'bg-slate-100 border-slate-300' : r === 3 ? 'bg-orange-100 border-orange-300' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700';
  const rankIcon = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">🏆 Gamification & Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-1">Earn points, unlock badges, and climb the leaderboard</p>
      </div>

      {myProfile && (
        <div className="card bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm mb-1">Your Profile</div>
              <div className="text-3xl font-bold">{myProfile.points} Points</div>
              <div className="text-white/80 text-sm mt-1">Level {myProfile.level} · {myProfile.pointsToNextLevel} pts to next level</div>
            </div>
            <div className="text-right">
              <div className="text-5xl">⭐</div>
              <div className="text-white/80 text-sm mt-1">{myProfile.badges?.length || 0} badges</div>
            </div>
          </div>
          {myProfile.badges?.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {myProfile.badges.map(b => (
                <span key={b.id} className="bg-white/20 rounded-full px-3 py-1 text-sm">{b.icon} {b.name}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold">🏅 Leaderboard</h3>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : leaderboard.map((s) => (
          <div key={s.rank} className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors ${rankBg(s.rank)}`}>
            <div className="w-10 text-center text-lg font-bold">{rankIcon(s.rank)}</div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
              {s.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{s.name}</div>
              <div className="text-xs text-slate-400">Class {s.class} · Level {s.level}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-orange-500">{s.points} pts</div>
              <div className="text-xs text-slate-400">{s.badges} badges</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default GamificationPage;
