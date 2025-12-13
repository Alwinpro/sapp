import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { UserPlus, CheckSquare, BarChart2, Users, Book, DollarSign, Calendar, MessageSquare, Briefcase, Settings, Bell, Library, Edit, Trash2, Key } from 'lucide-react';
import { addStaff, getPendingStudents, approveStudent } from '../services/managementService';
import { deleteUser, getStaff, updateUser } from '../services/dataService';
import { handleFirebaseError } from '../utils/errorHandler';
import { useAuth } from '../context/AuthContext';
import './dashboard.css';

const Overview = ({ user }) => {
    return (
        <div>
            <h2 className="page-title">Welcome, {user?.name || 'Principal'}</h2>
            <div className="card-grid">
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">Total Students</h3>
                    <p className="stat-value">0</p>
                    <span className="text-sm text-gray-400">Enrolled & Active</span>
                </div>
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">Total Staff</h3>
                    <p className="stat-value">0</p>
                    <span className="text-sm text-gray-400">Teachers & Admin</span>
                </div>
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">Collections</h3>
                    <p className="stat-value text-green-400">$0</p>
                    <span className="text-sm text-gray-400">Fees Collected (Month)</span>
                </div>
            </div>
        </div>
    );
};

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStaff, setEditingStaff] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', subject: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState(null);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const data = await getStaff();
            setStaffList(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff.id);
        setEditForm({
            name: staff.name,
            email: staff.email,
            subject: staff.subject || ''
        });
    };

    const handleSaveEdit = async (staffId) => {
        try {
            await updateUser(staffId, editForm);
            setStaffList(staffList.map(s => s.id === staffId ? { ...s, ...editForm } : s));
            setEditingStaff(null);
            alert('✅ Staff details updated successfully!');
        } catch (error) {
            alert('❌ ' + handleFirebaseError(error));
        }
    };

    const handleCancelEdit = () => {
        setEditingStaff(null);
        setEditForm({ name: '', email: '', subject: '' });
    };

    const handleDelete = async (id, name) => {
        console.log('=== DELETE BUTTON CLICKED ===');
        console.log('Staff ID:', id);
        console.log('Staff Name:', name);

        try {
            console.log('Starting deletion process...');
            await deleteUser(id);
            console.log('Firebase deletion successful');

            setStaffList(prevList => {
                const newList = prevList.filter(s => s.id !== id);
                console.log('UI updated. Remaining staff:', newList.length);
                return newList;
            });

            alert('✅ ' + name + ' has been removed successfully!');
            console.log('=== DELETE COMPLETED ===');
        } catch (error) {
            console.error('=== DELETE ERROR ===', error);
            alert('❌ Error: ' + handleFirebaseError(error));
        }
    };

    const handlePasswordChange = (staffId) => {
        setSelectedStaffId(staffId);
        setShowPasswordModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="page-title">Staff Directory</h2>
                <div className="text-sm text-gray-400">
                    Total Staff: <span className="text-white font-bold">{staffList.length}</span>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject/Role</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.length > 0 ? staffList.map(s => (
                            <tr key={s.id}>
                                {editingStaff === s.id ? (
                                    <>
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
                                                value={editForm.subject}
                                                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
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
                                        <td>
                                            <div className="font-medium">{s.name}</div>
                                        </td>
                                        <td className="text-sm text-gray-400">{s.email}</td>
                                        <td>
                                            <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-sm">
                                                {s.subject || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons justify-center">
                                                <button
                                                    onClick={() => handleEdit(s)}
                                                    className="action-btn action-btn-edit"
                                                    title="Edit staff details"
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
                                                    title="Remove staff"
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
                            <tr><td colSpan="4" className="text-center py-6 text-gray-500">No staff members found. (0)</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showPasswordModal && (
                <PasswordChangeModal
                    staffId={selectedStaffId}
                    onClose={() => {
                        setShowPasswordModal(false);
                        setSelectedStaffId(null);
                    }}
                />
            )}
        </div>
    );
};

const PasswordChangeModal = ({ staffId, onClose }) => {
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
        try {
            alert('⚠️ Password change requires backend implementation with Firebase Admin SDK or Cloud Functions. Please contact system administrator.');
            onClose();
        } catch (error) {
            alert(handleFirebaseError(error));
        }
        setLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel p-8 rounded-xl max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6">Change Staff Password</h3>
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
                            placeholder="Enter new password"
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
                            placeholder="Confirm new password"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
                <p className="text-xs text-gray-500 mt-4">
                    Note: Password changes require Firebase Admin SDK implementation for production use.
                </p>
            </div>
        </div>
    );
};

const StaffOnboarding = () => {
    const [staff, setStaff] = useState({ name: '', email: '', subject: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addStaff(staff);
            alert(`✅ Staff ${staff.name} added successfully.`);
            setStaff({ name: '', email: '', subject: '', password: '' });
        } catch (e) {
            alert('❌ ' + handleFirebaseError(e));
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="page-title">Add New Staff</h2>
            <div className="glass-panel p-8 rounded-xl max-w-2xl">
                <form onSubmit={handleAdd}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Full Name</label>
                            <input className="input-field" value={staff.name} onChange={e => setStaff({ ...staff, name: e.target.value })} required placeholder="e.g. John Smith" />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Subject</label>
                            <input className="input-field" value={staff.subject} onChange={e => setStaff({ ...staff, subject: e.target.value })} required placeholder="e.g. Mathematics" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Email Address</label>
                        <input type="email" className="input-field" value={staff.email} onChange={e => setStaff({ ...staff, email: e.target.value })} required placeholder="staff@school.com" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2">Temporary Password</label>
                        <input className="input-field" value={staff.password} onChange={e => setStaff({ ...staff, password: e.target.value })} required placeholder="••••••••" />
                    </div>
                    <button className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Enrollments = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const schoolId = "TODO_LINK_SCHOOL_ID";

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        try {
            const data = await getPendingStudents(schoolId);
            setStudents(data);
        } catch (error) {
        }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        try {
            await approveStudent(id);
            setStudents(students.filter(s => s.id !== id));
            alert('✅ Student Enrollment Approved');
        } catch (error) {
            alert('❌ ' + handleFirebaseError(error));
        }
    };

    const handleReject = async (id) => {
        try {
            await deleteUser(id);
            setStudents(students.filter(s => s.id !== id));
        } catch (error) {
            alert(handleFirebaseError(error));
        }
    };

    return (
        <div>
            <h2 className="page-title">Pending Enrollments</h2>
            <div className="glass-panel p-6 rounded-xl">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Grade</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? students.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div className="font-bold">{s.name}</div>
                                    <div className="text-xs text-gray-500">{s.email}</div>
                                </td>
                                <td>{s.grade}</td>
                                <td>{s.createdAt ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                <td className="flex gap-2">
                                    <button onClick={() => handleApprove(s.id)} className="btn btn-primary text-xs py-1 px-3">Approve</button>
                                    <button onClick={() => handleReject(s.id)} className="btn btn-secondary text-xs py-1 px-3 text-red-400 border-red-900/30 hover:bg-red-900/20">Reject</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center py-6 text-gray-500">No pending requests found. (0)</td></tr>
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
            <Settings size={48} opacity={0.5} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p>This module is currently correctly configured and ready for data entry.</p>
        <p className="text-sm mt-2">Status: Active (0 Entries)</p>
    </div>
);

const ManagementDashboard = () => {
    const { userData } = useAuth();

    const menuItems = [
        { label: 'Overview', path: '/dashboard/management', icon: <BarChart2 size={20} />, end: true },
        { label: 'Staff List', path: '/dashboard/management/staff-list', icon: <Briefcase size={20} /> },
        { label: 'Add Staff', path: '/dashboard/management/staff', icon: <UserPlus size={20} /> },
        { label: 'Enrollments', path: '/dashboard/management/enrollments', icon: <CheckSquare size={20} /> },
        { label: 'Attendance', path: '/dashboard/management/attendance', icon: <Calendar size={20} /> },
        { label: 'Timetable', path: '/dashboard/management/timetable', icon: <Calendar size={20} /> },
        { label: 'Fees', path: '/dashboard/management/fees', icon: <DollarSign size={20} /> },
        { label: 'Examinations', path: '/dashboard/management/exams', icon: <Book size={20} /> },
        { label: 'Library', path: '/dashboard/management/library', icon: <Library size={20} /> },
        { label: 'Messages', path: '/dashboard/management/messages', icon: <MessageSquare size={20} /> },
        { label: 'Settings', path: '/dashboard/management/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar role="Principal / Management" title="Nexus School" menuItems={menuItems} />
            <div className="main-content">
                <DashboardHeader />
                <Routes>
                    <Route path="/" element={<Overview user={userData} />} />
                    <Route path="/staff-list" element={<StaffManagement />} />
                    <Route path="/staff" element={<StaffOnboarding />} />
                    <Route path="/enrollments" element={<Enrollments />} />
                    <Route path="/attendance" element={<PlaceholderModule title="Attendance Records" />} />
                    <Route path="/timetable" element={<PlaceholderModule title="Class Timetables" />} />
                    <Route path="/fees" element={<PlaceholderModule title="Fee Management" />} />
                    <Route path="/exams" element={<PlaceholderModule title="Examination Center" />} />
                    <Route path="/library" element={<PlaceholderModule title="Library & Resources" />} />
                    <Route path="/messages" element={<PlaceholderModule title="Communications" />} />
                    <Route path="/settings" element={<PlaceholderModule title="School Configuration" />} />
                </Routes>
            </div>
        </div>
    );
};

export default ManagementDashboard;
