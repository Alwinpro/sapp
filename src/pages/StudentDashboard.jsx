import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Book, Calendar, CheckCircle, Award, Clock, DollarSign, Library, MessageSquare, Activity, Settings, Zap } from 'lucide-react';
import { getStudentGrades } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import './dashboard.css';

const StudentOverview = ({ user }) => {
    return (
        <div>
            <h2 className="page-title">Welcome, {user?.name || 'Student'}</h2>
            <div className="card-grid">
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">My Class</h3>
                    <p className="stat-value text-blue-400">{user?.grade || 'N/A'}</p>
                    <span className="text-sm text-gray-400">Section A</span>
                </div>
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">Attendance</h3>
                    <p className="stat-value text-green-400">0%</p>
                    <span className="text-sm text-gray-400">Present Days</span>
                </div>
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">Next Exam</h3>
                    <p className="stat-value text-purple-400">-</p>
                    <span className="text-sm text-gray-400">No Assessment Scheduled</span>
                </div>
            </div>
        </div>
    );
};

const ReportCard = () => {
    const { currentUser, userData } = useAuth();
    const [grades, setGrades] = useState([]);
    const [groupedGrades, setGroupedGrades] = useState({});
    const [selectedExam, setSelectedExam] = useState('internal1');
    const [academicYear, setAcademicYear] = useState('2025-26');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const examTypes = [
        { value: 'internal1', label: 'Internal Exam 1', icon: '📝', max: 30 },
        { value: 'internal2', label: 'Internal Exam 2', icon: '📝', max: 30 },
        { value: 'internal3', label: 'Internal Exam 3', icon: '📝', max: 30 },
        { value: 'internal4', label: 'Internal Exam 4', icon: '📝', max: 30 },
        { value: 'internal5', label: 'Internal Exam 5', icon: '📝', max: 30 },
        { value: 'final', label: 'Final Exam', icon: '🎓', max: 80 }
    ];

    const academicYears = ['2026-27', '2025-26', '2024-25', '2023-24', '2022-23'];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadGrades();
        }
    }, [currentUser]);

    const loadGrades = async () => {
        try {
            if (!currentUser) {
                console.log('❌ No current user found');
                return;
            }

            const studentId = currentUser.uid;
            console.log('=== LOADING STUDENT GRADES ===');
            console.log('Student ID:', studentId);

            const data = await getStudentGrades(studentId);
            console.log('✅ Grades fetched:', data);

            setGrades(data);

            const grouped = data.reduce((acc, grade) => {
                if (!acc[grade.subject]) {
                    acc[grade.subject] = {
                        subject: grade.subject,
                        teacherName: grade.teacherName,
                        internal1: null,
                        internal2: null,
                        internal3: null,
                        internal4: null,
                        internal5: null,
                        final: null
                    };
                }
                acc[grade.subject][grade.examType] = grade.marks;
                return acc;
            }, {});

            console.log('✅ Grouped grades:', grouped);
            setGroupedGrades(grouped);
        } catch (error) {
            console.error('❌ Error loading grades:', error);
        }
    };

    const calculateTotal = (subject) => {
        const internals = [
            subject.internal1,
            subject.internal2,
            subject.internal3,
            subject.internal4,
            subject.internal5
        ].filter(m => m !== null).map(m => parseInt(m));

        const internalTotal = internals.reduce((sum, mark) => sum + mark, 0);
        const finalMarks = subject.final ? parseInt(subject.final) : 0;
        const totalObtained = internalTotal + finalMarks;
        const internalMax = internals.length * 30;
        const finalMax = subject.final ? 80 : 0;
        const totalMax = internalMax + finalMax;

        if (totalMax === 0) return { obtained: 'N/A', max: 'N/A', percentage: 'N/A' };

        const percentage = Math.round((totalObtained / totalMax) * 100);

        return { obtained: totalObtained, max: totalMax, percentage: percentage };
    };

    const getGrade = (percentage) => {
        if (percentage === 'N/A') return 'N/A';
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    // Mobile Card View
    if (isMobile) {
        const currentYearIndex = academicYears.indexOf(academicYear);
        const canGoPrevious = currentYearIndex < academicYears.length - 1;
        const canGoNext = currentYearIndex > 0;

        return (
            <div className="mobile-report-card">
                <div className="report-header-mobile">
                    <h2 className="page-title">My Report Card</h2>
                    <div className="academic-year-selector">
                        <button
                            className="year-nav-btn"
                            onClick={() => {
                                if (canGoPrevious) {
                                    setAcademicYear(academicYears[currentYearIndex + 1]);
                                }
                            }}
                            disabled={!canGoPrevious}
                        >
                            ◀
                        </button>
                        <div className="current-year-display">
                            <span className="year-label">📅</span>
                            <span className="year-text">{academicYear}</span>
                        </div>
                        <button
                            className="year-nav-btn"
                            onClick={() => {
                                if (canGoNext) {
                                    setAcademicYear(academicYears[currentYearIndex - 1]);
                                }
                            }}
                            disabled={!canGoNext}
                        >
                            ▶
                        </button>
                    </div>
                </div>

                {/* Academic Year Info */}
                {academicYear !== '2025-26' && (
                    <div className="academic-year-notice">
                        <p>
                            {academicYear > '2025-26'
                                ? `📚 Viewing upcoming academic year: ${academicYear}`
                                : `📖 Viewing previous academic year: ${academicYear}`
                            }
                        </p>
                        <p className="text-sm">
                            {academicYear > '2025-26'
                                ? 'Results will be available once exams are conducted.'
                                : 'Showing historical results from past academic year.'}
                        </p>
                    </div>
                )}

                {/* Exam Selector */}
                <div className="exam-selector-grid">
                    {examTypes.map(exam => (
                        <button
                            key={exam.value}
                            className={`exam-selector-card ${selectedExam === exam.value ? 'active' : ''}`}
                            onClick={() => setSelectedExam(exam.value)}
                        >
                            <span className="exam-icon">{exam.icon}</span>
                            <span className="exam-label">{exam.label}</span>
                        </button>
                    ))}
                </div>

                {/* Subject Cards */}
                <div className="subject-cards-container">
                    {Object.values(groupedGrades).length > 0 ? Object.values(groupedGrades).map((subject, i) => {
                        const result = calculateTotal(subject);
                        const grade = getGrade(result.percentage);

                        return (
                            <div key={i} className="subject-card-mobile">
                                <div className="subject-card-header">
                                    <div>
                                        <h3 className="subject-name">{subject.subject}</h3>
                                        <p className="teacher-name">👨‍🏫 {subject.teacherName || 'N/A'}</p>
                                    </div>
                                    <div className="subject-grade-badge">
                                        <span className={`grade-letter ${result.percentage >= 50 ? 'pass' : 'fail'}`}>
                                            {grade}
                                        </span>
                                        <span className="grade-percentage">{result.percentage !== 'N/A' ? `${result.percentage}%` : 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Show selected exam marks */}
                                <div className="marks-list">
                                    <div className="mark-item single">
                                        <span className="mark-label">
                                            {examTypes.find(e => e.value === selectedExam)?.label}
                                        </span>
                                        <span className="mark-value">
                                            {subject[selectedExam]
                                                ? `${subject[selectedExam]}/${examTypes.find(e => e.value === selectedExam)?.max}`
                                                : 'Not Recorded'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="no-grades-mobile">
                            <p>📚 No grades recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop Table View (unchanged)
    return (
        <div>
            <h2 className="page-title">My Report Card</h2>
            <div className="glass-panel p-6 rounded-xl overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Teacher</th>
                            <th>INT 1</th>
                            <th>INT 2</th>
                            <th>INT 3</th>
                            <th>INT 4</th>
                            <th>INT 5</th>
                            <th>FINAL</th>
                            <th>Total</th>
                            <th>%</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(groupedGrades).length > 0 ? Object.values(groupedGrades).map((subject, i) => {
                            const result = calculateTotal(subject);
                            const grade = getGrade(result.percentage);
                            return (
                                <tr key={i}>
                                    <td className="font-bold">{subject.subject}</td>
                                    <td className="text-sm">{subject.teacherName || 'N/A'}</td>
                                    <td className="text-center">{subject.internal1 ? `${subject.internal1}/30` : '-'}</td>
                                    <td className="text-center">{subject.internal2 ? `${subject.internal2}/30` : '-'}</td>
                                    <td className="text-center">{subject.internal3 ? `${subject.internal3}/30` : '-'}</td>
                                    <td className="text-center">{subject.internal4 ? `${subject.internal4}/30` : '-'}</td>
                                    <td className="text-center">{subject.internal5 ? `${subject.internal5}/30` : '-'}</td>
                                    <td className="text-center font-bold">{subject.final ? `${subject.final}/80` : '-'}</td>
                                    <td className="text-center font-bold text-blue-400">
                                        {result.obtained !== 'N/A' ? `${result.obtained}/${result.max}` : 'N/A'}
                                    </td>
                                    <td className="text-center font-bold text-green-400">
                                        {result.percentage !== 'N/A' ? `${result.percentage}%` : 'N/A'}
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-badge ${result.percentage >= 50 ? 'status-active' : 'status-inactive'}`}>
                                            {grade}
                                        </span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="11" className="text-center py-6 text-gray-500">
                                No grades recorded yet.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PlaceholderModule = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <div className="p-4 rounded-full bg-white/5 mb-4">
            <Zap size={48} opacity={0.5} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p>This module is enabled for student view.</p>
    </div>
);

const StudentDashboard = () => {
    const { userData } = useAuth();

    const menuItems = [
        { label: 'Overview', path: '/dashboard/student', icon: <CheckCircle size={20} />, end: true },
        { label: 'Report Card', path: '/dashboard/student/grades', icon: <Award size={20} /> },
        { label: 'Timetable', path: '/dashboard/student/timetable', icon: <Calendar size={20} /> },
        { label: 'Subjects', path: '/dashboard/student/subjects', icon: <Book size={20} /> },
        { label: 'Attendance', path: '/dashboard/student/attendance', icon: <Clock size={20} /> },
        { label: 'Fees', path: '/dashboard/student/fees', icon: <DollarSign size={20} /> },
        { label: 'Library', path: '/dashboard/student/library', icon: <Library size={20} /> },
        { label: 'Messages', path: '/dashboard/student/messages', icon: <MessageSquare size={20} /> },
        { label: 'Activities', path: '/dashboard/student/activities', icon: <Activity size={20} /> },
        { label: 'Settings', path: '/dashboard/student/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar role="Student" title="Student Portal" menuItems={menuItems} />
            <div className="main-content">
                <DashboardHeader />
                <Routes>
                    <Route path="/" element={<StudentOverview user={userData} />} />
                    <Route path="/grades" element={<ReportCard />} />
                    <Route path="/timetable" element={<PlaceholderModule title="Class Timetable" />} />
                    <Route path="/subjects" element={<PlaceholderModule title="Subject List" />} />
                    <Route path="/attendance" element={<PlaceholderModule title="My Attendance" />} />
                    <Route path="/fees" element={<PlaceholderModule title="Fee Status" />} />
                    <Route path="/library" element={<PlaceholderModule title="Library Books" />} />
                    <Route path="/messages" element={<PlaceholderModule title="Notifications" />} />
                    <Route path="/activities" element={<PlaceholderModule title="Extra-curricular Activities" />} />
                    <Route path="/settings" element={<PlaceholderModule title="Profile Settings" />} />
                </Routes>
            </div>
        </div>
    );
};

export default StudentDashboard;
