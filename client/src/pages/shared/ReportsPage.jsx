import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { reportService, studentService } from '../../services/api';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const isTeacher = ['admin', 'teacher'].includes(user?.role);
  const [report, setReport] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(isTeacher ? '' : user._id);
  const [selectedClass, setSelectedClass] = useState(user?.studentProfile?.class || '10-A');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTeacher) {
      studentService.getByClass(selectedClass).then(r => setStudents(r.data.students || []));
    } else {
      loadReport(user._id);
    }
  }, [selectedClass]);

  const loadReport = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await reportService.getStudentReport(id);
      setReport(data.report);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const generatePDF = async () => {
    if (!report) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const { student, subjects, overallAvg, overallGrade, attendance } = report;

    // Header
    doc.setFillColor(26, 75, 255);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EduNexus AI', 15, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Student Progress Report', 15, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 130, 28);

    // Student info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(student.name, 15, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Class: ${student.studentProfile?.class || '—'}`, 15, 63);
    doc.text(`Roll No: ${student.studentProfile?.rollNumber || '—'}`, 60, 63);
    doc.text(`Email: ${student.email}`, 110, 63);

    // Overall stats box
    doc.setFillColor(240, 244, 255);
    doc.roundedRect(15, 70, 180, 25, 3, 3, 'F');
    doc.setTextColor(26, 75, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall: ${overallAvg}% (${overallGrade})`, 20, 83);
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Attendance: ${attendance.percentage}%  |  Present: ${attendance.present}  |  Absent: ${attendance.absent}`, 20, 90);

    // Subject table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject-wise Performance', 15, 108);

    autoTable(doc, {
      startY: 112,
      head: [['Subject', 'Average', 'Grade', 'Status']],
      body: subjects.map(s => [
        s.subject,
        `${s.average}%`,
        s.grade,
        s.average >= 80 ? 'Excellent' : s.average >= 60 ? 'Good' : s.average >= 40 ? 'Needs Improvement' : 'Critical'
      ]),
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [26, 75, 255], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 255] },
      columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' } },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(240, 244, 255);
    doc.rect(0, pageHeight - 20, 210, 20, 'F');
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.text('EduNexus AI — NextGen Student Management System', 15, pageHeight - 8);
    doc.text('Confidential', 170, pageHeight - 8);

    doc.save(`Report_${student.name.replace(' ', '_')}.pdf`);
  };

  const GRADE_BG = { 'A+': 'text-emerald-600 bg-emerald-50', A: 'text-emerald-600 bg-emerald-50', 'B+': 'text-blue-600 bg-blue-50', B: 'text-blue-600 bg-blue-50', C: 'text-yellow-600 bg-yellow-50', D: 'text-orange-600 bg-orange-50', F: 'text-red-600 bg-red-50' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Generate and download student progress reports</p>
        </div>
        {report && (
          <button onClick={generatePDF} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download PDF
          </button>
        )}
      </div>

      {isTeacher && (
        <div className="card flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-slate-600 mb-1">Class</label>
            <select className="input-field" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setReport(null); setSelectedStudent(''); }}>
              {['10-A','10-B','11-A','11-B','12-A','12-B'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-600 mb-1">Student</label>
            <select className="input-field" value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); if (e.target.value) loadReport(e.target.value); }}>
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <button onClick={() => selectedStudent && loadReport(selectedStudent)} className="btn-primary">Generate Report</button>
        </div>
      )}

      {loading && <div className="card animate-pulse h-48 rounded-2xl" />}

      {report && !loading && (
        <div className="space-y-6 animate-in">
          {/* Student card */}
          <div className="card bg-gradient-to-br from-primary-500 to-violet-600 text-white border-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white/70 text-sm mb-1">Student Report Card</div>
                <h2 className="text-2xl font-bold">{report.student.name}</h2>
                <div className="text-white/80 text-sm mt-1">
                  Class {report.student.studentProfile?.class} &nbsp;|&nbsp; Roll: {report.student.studentProfile?.rollNumber}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold`}>{report.overallGrade}</div>
                <div className="text-white/70 text-sm">Overall Grade</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
              {[
                { label: 'Overall Average', value: `${report.overallAvg}%` },
                { label: 'Attendance', value: `${report.attendance.percentage}%` },
                { label: 'Days Present', value: `${report.attendance.present}/${report.attendance.total}` },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-white/70 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold">Subject-wise Performance</h3>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="table-th">Subject</th>
                  <th className="table-th">Average Score</th>
                  <th className="table-th">Grade</th>
                  <th className="table-th">Performance Bar</th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((s) => (
                  <tr key={s.subject} className="table-row">
                    <td className="table-td font-medium">{s.subject}</td>
                    <td className="table-td font-semibold">{s.average}%</td>
                    <td className="table-td">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${GRADE_BG[s.grade] || ''}`}>{s.grade}</span>
                    </td>
                    <td className="table-td w-48">
                      <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${s.average >= 80 ? 'bg-emerald-500' : s.average >= 60 ? 'bg-primary-500' : 'bg-red-500'}`}
                          style={{ width: `${s.average}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-400 text-center">Report generated on {new Date(report.generatedAt).toLocaleString('en-IN')} · EduNexus AI</p>
        </div>
      )}

      {!report && !loading && (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Report Generated</h3>
          <p className="text-slate-400 text-sm">{isTeacher ? 'Select a class and student to generate their report' : 'Your report will appear here'}</p>
          {!isTeacher && <button onClick={() => loadReport(user._id)} className="btn-primary mt-4">Generate My Report</button>}
        </div>
      )}
    </div>
  );
}
