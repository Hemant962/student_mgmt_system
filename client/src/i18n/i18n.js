import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Nav
      dashboard: 'Dashboard',
      students: 'Students',
      attendance: 'Attendance',
      marks: 'Marks & Grades',
      assignments: 'Assignments',
      timetable: 'Timetable',
      reports: 'Reports',
      chat: 'Chat',
      notifications: 'Notifications',
      settings: 'Settings',
      logout: 'Logout',
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      loading: 'Loading...',
      noData: 'No data available',
      // Dashboard
      totalStudents: 'Total Students',
      totalTeachers: 'Total Teachers',
      avgAttendance: 'Avg. Attendance',
      todayPresent: "Today's Present",
      // Attendance
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      markAttendance: 'Mark Attendance',
      attendancePercentage: 'Attendance %',
      // Marks
      subject: 'Subject',
      marks: 'Marks',
      grade: 'Grade',
      average: 'Average',
      // AI
      aiRecommendations: 'AI Recommendations',
      prediction: 'Performance Prediction',
      careerSuggestions: 'Career Suggestions',
      weakSubjects: 'Weak Subjects',
      strongSubjects: 'Strong Subjects',
      passProbability: 'Pass Probability',
      // Gamification
      points: 'Points',
      badges: 'Badges',
      level: 'Level',
      leaderboard: 'Leaderboard',
    },
  },
  ta: {
    translation: {
      // Nav
      dashboard: 'டாஷ்போர்டு',
      students: 'மாணவர்கள்',
      attendance: 'வருகை',
      marks: 'மதிப்பெண்கள்',
      assignments: 'பணிகள்',
      timetable: 'நேர அட்டவணை',
      reports: 'அறிக்கைகள்',
      chat: 'அரட்டை',
      notifications: 'அறிவிப்புகள்',
      settings: 'அமைப்புகள்',
      logout: 'வெளியேறு',
      // Common
      save: 'சேமி',
      cancel: 'ரத்து',
      delete: 'நீக்கு',
      edit: 'திருத்து',
      add: 'சேர்',
      search: 'தேடு',
      filter: 'வடிகட்டு',
      export: 'ஏற்றுமதி',
      loading: 'ஏற்றுகிறது...',
      noData: 'தரவு இல்லை',
      // Dashboard
      totalStudents: 'மொத்த மாணவர்கள்',
      totalTeachers: 'மொத்த ஆசிரியர்கள்',
      avgAttendance: 'சராசரி வருகை',
      todayPresent: 'இன்று வந்தவர்கள்',
      // Attendance
      present: 'வந்தது',
      absent: 'வரவில்லை',
      late: 'தாமதம்',
      markAttendance: 'வருகை குறி',
      attendancePercentage: 'வருகை சதவீதம்',
      // Marks
      subject: 'பாடம்',
      marks: 'மதிப்பெண்கள்',
      grade: 'தரம்',
      average: 'சராசரி',
      // AI
      aiRecommendations: 'AI பரிந்துரைகள்',
      prediction: 'செயல்திறன் கணிப்பு',
      careerSuggestions: 'தொழில் பரிந்துரைகள்',
      weakSubjects: 'பலவீனமான பாடங்கள்',
      strongSubjects: 'வலிமையான பாடங்கள்',
      passProbability: 'தேர்ச்சி நிகழ்தகவு',
      // Gamification
      points: 'புள்ளிகள்',
      badges: 'பதக்கங்கள்',
      level: 'நிலை',
      leaderboard: 'தரவரிசை பட்டியல்',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
