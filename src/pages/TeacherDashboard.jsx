import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { UserPlus, ClipboardList, BookOpen, Users, Calendar, BarChart2, MessageSquare, Edit, Trash2, Key } from 'lucide-react';
import { addStudent } from '../services/teacherService';
import { getEnrolledStudents, saveGrade, getStudentGrades, updateGrade, deleteGrade, deleteUser, updateUser } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { handleFirebaseError } from '../utils/errorHandler';
import './dashboard.css';

const Overview = ({ user }) => {
    return (
        <div>
            <h2 className="page-title">Welcome, {user?.name || 'Teacher'}</h2>
            <div className="card-grid">
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">My Students</h3>
                    <p className="stat-value">0</p>
                    <span className="text-sm text-gray-400">Total Enrolled</span>
                </div>
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">Pending Tasks</h3>
                    <p className="stat-value">0</p>
                    <span className="text-sm text-gray-400">Grading & Attendance</span>
                </div>
            </div>
        </div>
    );
}

// View Students with Class Filter
const ViewStudents = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [classes, setClasses] = useState([]);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', grade: '', rollNumber: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    useEffect(() => {
        loadStudents();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            setFilteredStudents(students.filter(s => s.grade === selectedClass));
        } else {
            setFilteredStudents(students);
        }
    }, [selectedClass, students]);

    const loadStudents = async () => {
        try {
            const data = await getEnrolledStudents();
            setStudents(data);
            setFilteredStudents(data);

            // Extract unique classes
            const uniqueClasses = [...new Set(data.map(s => s.grade).filter(Boolean))];
            setClasses(uniqueClasses.sort());
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student.id);
        setEditForm({
            name: student.name,
            email: student.email,
            grade: student.grade || '',
            rollNumber: student.rollNumber || ''
        });
    };

    const handleSaveEdit = async (studentId) => {
        try {
            await updateUser(studentId, editForm);
            setStudents(students.map(s => s.id === studentId ? { ...s, ...editForm } : s));
            setEditingStudent(null);
            alert('✅ Student details updated successfully!');
        } catch (error) {
            alert('❌ ' + handleFirebaseError(error));
        }
    };

    const handleCancelEdit = () => {
        setEditingStudent(null);
        setEditForm({ name: '', email: '', grade: '', rollNumber: '' });
    };

    const handleDelete = async (id, name) => {
        console.log('Delete student:', id, name);
        try {
            await deleteUser(id);
            setStudents(prevList => prevList.filter(s => s.id !== id));
            alert('✅ ' + name + ' has been removed successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ Error: ' + handleFirebaseError(error));
        }
    };

    const handlePasswordChange = (studentId) => {
        setSelectedStudentId(studentId);
        setShowPasswordModal(true);
    };

    return (
        <div>
            <h2 className="page-title">View Students</h2>

            {/* Class Filter */}
            <div className="glass-panel p-4 rounded-xl mb-6">
                <div className="flex items-center gap-4">
                    <label className="text-gray-400 font-medium">Filter by Class:</label>
                    <select
                        className="input-field max-w-xs"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {classes.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-400">
                        Showing: <span className="text-white font-bold">{filteredStudents.length}</span> students
                    </span>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Class</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? filteredStudents.map(s => (
                            <tr key={s.id}>
                                {editingStudent === s.id ? (
                                    <>
                                        <td>
                                            <input
                                                className="input-field py-1 px-2 text-sm"
                                                value={editForm.rollNumber}
                                                onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="input-field py-1 px-2 text-sm"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="input-field py-1 px-2 text-sm"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="input-field py-1 px-2 text-sm"
                                                value={editForm.grade}
                                                onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <div className="edit-actions justify-center">
                                                <button
                                                    onClick={() => handleSaveEdit(s.id)}
                                                    className="btn-save"
                                                    type="button"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="btn-cancel"
                                                    type="button"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{s.rollNumber || 'N/A'}</td>
                                        <td className="font-medium">{s.name}</td>
                                        <td className="text-sm text-gray-400">{s.email}</td>
                                        <td>
                                            <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-sm">
                                                {s.grade}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons justify-center">
                                                <button
                                                    onClick={() => handleEdit(s)}
                                                    className="action-btn action-btn-edit"
                                                    title="Edit student"
                                                    type="button"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePasswordChange(s.id)}
                                                    className="action-btn action-btn-password"
                                                    title="Change password"
                                                    type="button"
                                                >
                                                    <Key size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id, s.name)}
                                                    className="action-btn action-btn-delete"
                                                    title="Remove student"
                                                    type="button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center py-6 text-gray-500">No students found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showPasswordModal && (
                <PasswordChangeModal
                    studentId={selectedStudentId}
                    onClose={() => {
                        setShowPasswordModal(false);
                        setSelectedStudentId(null);
                    }}
                />
            )}
        </div>
    );
};

// Password Change Modal Component
const PasswordChangeModal = ({ studentId, onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('❌ Passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            alert('❌ Password must be at least 6 characters long!');
            return;
        }

        setLoading(true);
        alert('⚠️ Password change requires backend implementation with Firebase Admin SDK.');
        onClose();
        setLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel p-8 rounded-xl max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6">Change Student Password</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">New Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Enhanced Grading Module with Class Selection
const GradingModule = ({ user }) => {
    const { currentUser } = useAuth(); // Get currentUser for uid
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [examType, setExamType] = useState('internal1');
    const [marks, setMarks] = useState('');
    const [maxMarks, setMaxMarks] = useState('30'); // Customizable max marks
    const [subject, setSubject] = useState(user?.subject || 'General');
    const [loading, setLoading] = useState(false);
    const [existingGrades, setExistingGrades] = useState([]);
    const [editingGrade, setEditingGrade] = useState(null);
    const [editMarks, setEditMarks] = useState('');

    const examTypes = [
        { value: 'internal1', label: 'Internal Exam 1', maxMarks: 30 },
        { value: 'internal2', label: 'Internal Exam 2', maxMarks: 30 },
        { value: 'internal3', label: 'Internal Exam 3', maxMarks: 30 },
        { value: 'internal4', label: 'Internal Exam 4', maxMarks: 30 },
        { value: 'internal5', label: 'Internal Exam 5', maxMarks: 30 },
        { value: 'final', label: 'Final Exam', maxMarks: 80 }
    ];

    useEffect(() => {
        loadStudents();
        if (user?.subject) setSubject(user.subject);
    }, [user]);

    useEffect(() => {
        if (selectedClass) {
            setFilteredStudents(students.filter(s => s.grade === selectedClass));
        } else {
            setFilteredStudents([]);
        }
        setSelectedStudent('');
    }, [selectedClass, students]);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentGrades();
        } else {
            setExistingGrades([]);
        }
    }, [selectedStudent]);

    // Auto-update max marks when exam type changes
    useEffect(() => {
        const exam = examTypes.find(e => e.value === examType);
        if (exam) {
            setMaxMarks(exam.maxMarks.toString());
        }
    }, [examType]);

    const loadStudents = async () => {
        const data = await getEnrolledStudents();
        setStudents(data);

        const uniqueClasses = [...new Set(data.map(s => s.grade).filter(Boolean))];
        setClasses(uniqueClasses.sort());
    };

    const loadStudentGrades = async () => {
        try {
            const grades = await getStudentGrades(selectedStudent);
            setExistingGrades(grades.filter(g => g.subject === subject));
        } catch (error) {
            console.error(error);
        }
    };

    const getCurrentMaxMarks = () => {
        const exam = examTypes.find(e => e.value === examType);
        return exam ? exam.maxMarks : 100;
    };

    const handleSaveGrade = async (e) => {
        e.preventDefault();

        console.log('=== SAVE GRADE CLICKED ===');
        console.log('Selected Student:', selectedStudent);
        console.log('Selected Class:', selectedClass);
        console.log('Exam Type:', examType);
        console.log('Marks:', marks);
        console.log('Subject:', subject);
        console.log('User:', user);

        if (!selectedStudent) {
            console.log('ERROR: No student selected');
            return alert("Please select a student");
        }

        const maxMarks = getCurrentMaxMarks();
        console.log('Max Marks for this exam:', maxMarks);

        if (parseInt(marks) > maxMarks) {
            console.log('ERROR: Marks exceed maximum');
            return alert(`❌ Marks cannot exceed ${maxMarks} for this exam!`);
        }

        setLoading(true);
        try {
            const studentObj = students.find(s => s.id === selectedStudent);
            console.log('Student Object:', studentObj);

            console.log('Calling saveGrade with:', {
                studentId: selectedStudent,
                studentName: studentObj.name,
                subject: subject,
                examType: examType,
                marks: marks,
                teacherId: currentUser.uid,
                teacherName: user.name
            });

            await saveGrade(selectedStudent, studentObj.name, subject, examType, marks, currentUser.uid, user.name);
            console.log('Grade saved successfully!');

            alert("✅ Grade saved successfully!");
            setMarks('');
            loadStudentGrades();
        } catch (error) {
            console.error('ERROR saving grade:', error);
            alert('❌ Error: ' + handleFirebaseError(error));
        }
        setLoading(false);
        console.log('=== SAVE GRADE COMPLETED ===');
    };

    const handleEditGrade = (grade) => {
        setEditingGrade(grade.id);
        setEditMarks(grade.marks);
    };

    const handleUpdateGrade = async (gradeId) => {
        const grade = existingGrades.find(g => g.id === gradeId);
        const exam = examTypes.find(e => e.value === grade.examType);
        const maxMarks = exam ? exam.maxMarks : 100;

        if (parseInt(editMarks) > maxMarks) {
            return alert(`❌ Marks cannot exceed ${maxMarks} for this exam!`);
        }

        try {
            await updateGrade(gradeId, editMarks);
            setEditingGrade(null);
            loadStudentGrades();
            alert("✅ Grade updated successfully!");
        } catch (error) {
            alert(handleFirebaseError(error));
        }
    };

    const handleDeleteGrade = async (gradeId) => {
        try {
            await deleteGrade(gradeId);
            loadStudentGrades();
            alert("✅ Grade deleted successfully!");
        } catch (error) {
            alert(handleFirebaseError(error));
        }
    };

    return (
        <div>
            <h2 className="page-title">Record Grades</h2>
            <p className="text-gray-400 mb-6">Subject: <strong className="text-white">{subject}</strong></p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Entry Form */}
                <div className="glass-panel p-8 rounded-xl">
                    <h3 className="text-lg font-bold mb-4">Add/Update Marks</h3>

                    <form onSubmit={handleSaveGrade}>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Select Class</label>
                            <select
                                className="input-field"
                                value={selectedClass}
                                onChange={e => setSelectedClass(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Class --</option>
                                {classes.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Select Student</label>
                            <select
                                className="input-field"
                                value={selectedStudent}
                                onChange={e => setSelectedStudent(e.target.value)}
                                required
                                disabled={!selectedClass}
                            >
                                <option value="">-- Choose Student --</option>
                                {filteredStudents.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Exam Type</label>
                            <select className="input-field" value={examType} onChange={e => setExamType(e.target.value)} required>
                                {examTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">
                                Maximum Marks (Out of)
                                <span className="text-xs text-gray-500 ml-2">You can change this</span>
                            </label>
                            <input
                                type="number"
                                className="input-field"
                                value={maxMarks}
                                onChange={e => setMaxMarks(e.target.value)}
                                required
                                min="1"
                                max="200"
                                placeholder="e.g. 30, 50, 80"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">
                                Marks Obtained (Out of {maxMarks || '?'})
                            </label>
                            <input
                                type="number"
                                className="input-field"
                                value={marks}
                                onChange={e => setMarks(e.target.value)}
                                required
                                min="0"
                                max={maxMarks}
                            />
                        </div>

                        <button className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Grade'}
                        </button>
                    </form>
                </div>

                {/* Existing Grades */}
                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-4">Existing Grades</h3>
                    {selectedStudent ? (
                        <div className="space-y-2">
                            {existingGrades.length > 0 ? existingGrades.map(grade => {
                                const exam = examTypes.find(t => t.value === grade.examType);
                                return (
                                    <div key={grade.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex-1">
                                            <div className="font-bold text-white">{exam?.label}</div>
                                            {editingGrade === grade.id ? (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="number"
                                                        className="input-field py-1 px-2 text-sm w-24"
                                                        value={editMarks}
                                                        onChange={(e) => setEditMarks(e.target.value)}
                                                        min="0"
                                                        max={exam?.maxMarks}
                                                    />
                                                    <span className="text-sm text-gray-400">/ {exam?.maxMarks}</span>
                                                    <button
                                                        onClick={() => handleUpdateGrade(grade.id)}
                                                        className="btn-save text-xs px-2 py-1"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingGrade(null)}
                                                        className="btn-cancel text-xs px-2 py-1"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-400">
                                                    Marks: {grade.marks}/{exam?.maxMarks}
                                                </div>
                                            )}
                                        </div>
                                        {editingGrade !== grade.id && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditGrade(grade)}
                                                    className="action-btn action-btn-edit"
                                                    title="Edit marks"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGrade(grade.id)}
                                                    className="action-btn action-btn-delete"
                                                    title="Delete grade"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            }) : (
                                <p className="text-gray-500 text-center py-4">No grades recorded yet.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Select a class and student to view grades.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const AddStudentComponent = () => {
    const [formData, setFormData] = useState({ name: '', email: '', rollNumber: '', password: '', grade: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addStudent(formData);
            alert(`✅ Student ${formData.name} added! Status: Pending Approval.`);
            setFormData({ name: '', email: '', rollNumber: '', password: '', grade: '' });
        } catch (error) {
            console.error(error);
            alert(handleFirebaseError(error));
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="page-title">Student Onboarding</h2>
            <div className="glass-panel p-8 rounded-xl max-w-2xl">
                <h3 className="mb-4 font-bold text-lg">Add New Student to Class</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Student Name</label>
                            <input className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Full Name" />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Grade / Class</label>
                            <input className="input-field" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} required placeholder="e.g. 10A" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Student/Parent Email</label>
                        <input className="input-field" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="student@example.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-400 mb-2">Roll Number</label>
                            <input className="input-field" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} required placeholder="e.g. 104" />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Temp Password</label>
                            <input className="input-field" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Required for login" />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing...' : 'Add Student & Generate Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const PlaceholderModule = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <div className="p-4 rounded-full bg-white/5 mb-4">
            <ClipboardList size={48} opacity={0.5} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p>This module is available for teacher input.</p>
    </div>
);

const TeacherDashboard = () => {
    const { userData } = useAuth();

    const menuItems = [
        { label: 'Overview', path: '/dashboard/teacher', icon: <BarChart2 size={20} />, end: true },
        { label: 'View Students', path: '/dashboard/teacher/students', icon: <Users size={20} /> },
        { label: 'Add Student', path: '/dashboard/teacher/add-student', icon: <UserPlus size={20} /> },
        { label: 'Record Grades', path: '/dashboard/teacher/grades', icon: <BookOpen size={20} /> },
        { label: 'Daily Attendance', path: '/dashboard/teacher/attendance', icon: <Calendar size={20} /> },
        { label: 'Messages', path: '/dashboard/teacher/messages', icon: <MessageSquare size={20} /> },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar role="Teacher" title="Teacher Portal" menuItems={menuItems} />
            <div className="main-content">
                <DashboardHeader />
                <Routes>
                    <Route path="/" element={<Overview user={userData} />} />
                    <Route path="/students" element={<ViewStudents />} />
                    <Route path="/add-student" element={<AddStudentComponent />} />
                    <Route path="/grades" element={<GradingModule user={userData} />} />
                    <Route path="/attendance" element={<PlaceholderModule title="Attendance Register" />} />
                    <Route path="/messages" element={<PlaceholderModule title="Parent Communications" />} />
                </Routes>
            </div>
        </div>
    );
};

export default TeacherDashboard;
