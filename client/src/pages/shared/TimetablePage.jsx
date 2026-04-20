import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { timetableService } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = ['bg-primary-100 text-primary-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Tamil', 'Physical Education', 'Art'];

const DEFAULT_TIMETABLE = {
  '10-A': {
    Monday: [
      { subject: 'Mathematics', time: '08:00 - 08:45', room: 'R101' },
      { subject: 'English', time: '08:45 - 09:30', room: 'R102' },
      { subject: 'Science', time: '09:45 - 10:30', room: 'Lab 1' },
      { subject: 'Tamil', time: '10:30 - 11:15', room: 'R101' },
      { subject: 'History', time: '11:30 - 12:15', room: 'R103' },
      { subject: 'Computer Science', time: '12:15 - 01:00', room: 'Lab 2' },
    ],
    Tuesday: [
      { subject: 'Science', time: '08:00 - 08:45', room: 'Lab 1' },
      { subject: 'Mathematics', time: '08:45 - 09:30', room: 'R101' },
      { subject: 'English', time: '09:45 - 10:30', room: 'R102' },
      { subject: 'Computer Science', time: '10:30 - 11:15', room: 'Lab 2' },
      { subject: 'Tamil', time: '11:30 - 12:15', room: 'R101' },
      { subject: 'Physical Education', time: '12:15 - 01:00', room: 'Ground' },
    ],
    Wednesday: [
      { subject: 'Tamil', time: '08:00 - 08:45', room: 'R101' },
      { subject: 'History', time: '08:45 - 09:30', room: 'R103' },
      { subject: 'Mathematics', time: '09:45 - 10:30', room: 'R101' },
      { subject: 'Science', time: '10:30 - 11:15', room: 'Lab 1' },
      { subject: 'English', time: '11:30 - 12:15', room: 'R102' },
      { subject: 'Art', time: '12:15 - 01:00', room: 'Art Room' },
    ],
    Thursday: [
      { subject: 'Computer Science', time: '08:00 - 08:45', room: 'Lab 2' },
      { subject: 'Tamil', time: '08:45 - 09:30', room: 'R101' },
      { subject: 'History', time: '09:45 - 10:30', room: 'R103' },
      { subject: 'Mathematics', time: '10:30 - 11:15', room: 'R101' },
      { subject: 'Science', time: '11:30 - 12:15', room: 'Lab 1' },
      { subject: 'English', time: '12:15 - 01:00', room: 'R102' },
    ],
    Friday: [
      { subject: 'English', time: '08:00 - 08:45', room: 'R102' },
      { subject: 'Science', time: '08:45 - 09:30', room: 'Lab 1' },
      { subject: 'Tamil', time: '09:45 - 10:30', room: 'R101' },
      { subject: 'Computer Science', time: '10:30 - 11:15', room: 'Lab 2' },
      { subject: 'Mathematics', time: '11:30 - 12:15', room: 'R101' },
      { subject: 'History', time: '12:15 - 01:00', room: 'R103' },
    ],
  },
};

export default function TimetablePage() {
  const { user } = useAuthStore();
  const cls = user?.studentProfile?.class || user?.teacherProfile?.classes?.[0] || '10-A';
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || 'Monday');
  const timetable = DEFAULT_TIMETABLE[cls] || DEFAULT_TIMETABLE['10-A'];
  const todayPeriods = timetable[selectedDay] || [];
  const subjectColorMap = {};
  SUBJECTS.forEach((s, i) => { subjectColorMap[s] = COLORS[i % COLORS.length]; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">📅 Timetable</h1>
        <p className="text-slate-500 text-sm mt-1">Class {cls} — Weekly Schedule</p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map(day => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${selectedDay === day ? 'bg-primary-500 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}>
            {day.slice(0, 3)}
            {day === DAYS[new Date().getDay() - 1] && <span className="ml-1 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />}
          </button>
        ))}
      </div>

      {/* Periods */}
      <div className="space-y-3">
        {todayPeriods.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-slate-500">No classes on {selectedDay}</p>
          </div>
        ) : todayPeriods.map((p, i) => (
          <div key={i} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="text-center w-14 flex-shrink-0">
              <div className="text-lg font-bold text-slate-800 dark:text-white">{i + 1}</div>
              <div className="text-xs text-slate-400">Period</div>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-600" />
            <div className="flex-1">
              <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mb-1 ${subjectColorMap[p.subject] || COLORS[0]}`}>
                {p.subject}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>⏰ {p.time}</span>
                <span>🚪 {p.room}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly overview */}
      <div className="card overflow-x-auto">
        <h3 className="section-title">Weekly Overview</h3>
        <div className="grid grid-cols-5 gap-2 min-w-[600px]">
          {DAYS.slice(0, 5).map(day => (
            <div key={day}>
              <div className={`text-xs font-semibold text-center mb-2 ${day === selectedDay ? 'text-primary-500' : 'text-slate-500'}`}>{day.slice(0, 3)}</div>
              <div className="space-y-1">
                {(timetable[day] || []).map((p, i) => (
                  <div key={i} className={`text-center py-1.5 px-2 rounded-lg text-xs font-medium truncate ${subjectColorMap[p.subject] || COLORS[0]}`}>
                    {p.subject.slice(0, 4)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
