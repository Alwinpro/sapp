import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Shield, PlusCircle, Users, Settings, Database, Server, Smartphone, Globe, MessageCircle, Lock, AlertTriangle, FileText } from 'lucide-react';
import { createSchool, getAllUsers } from '../services/adminService';
import { deleteUser } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { handleFirebaseError } from '../utils/errorHandler';
import './dashboard.css';

const Overview = ({ user }) => {
    return (
        <div>
            <h2 className="page-title">System Status - {user?.name || 'Administrator'}</h2>
            <div className="card-grid">
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">System Uptime</h3>
                    <p className="stat-value text-green-400">99.9%</p>
                    <span className="text-sm text-gray-400">Services Operational</span>
                </div>
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">Active Schools</h3>
                    <p className="stat-value">1</p>
                    <span className="text-sm text-gray-400">Tenants Loaded</span>
                </div>
                <div className="glass-panel dashboard-card">
                    <h3 className="card-title">Security Logs</h3>
                    <p className="stat-value text-yellow-400">0</p>
                    <span className="text-sm text-gray-400">Critical Alerts</span>
                </div>
            </div>
        </div>
    );
};

const SchoolManagement = () => {
    const [formData, setFormData] = useState({ name: '', address: '', contact: '', principalEmail: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createSchool(formData, formData.password);
            alert('School created successfully! Management user created.');
            setFormData({ name: '', address: '', contact: '', principalEmail: '', password: '' });
        } catch (error) {
            console.error(error);
            alert(handleFirebaseError(error));
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="page-title">School Management</h2>
            <div className="glass-panel p-8 rounded-xl max-w-2xl">
                <h3 className="text-xl font-bold mb-6">Create New School Instance</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">School Name</label>
                        <input
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Address</label>
                        <input
                            className="input-field"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Contact Number</label>
                        <input
                            className="input-field"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-400 mb-2">Principal/Management Email</label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.principalEmail}
                                onChange={(e) => setFormData({ ...formData, principalEmail: e.target.value })}
                                required
                                placeholder="principal@school.com"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Management Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="Values123!"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing...' : 'Create School & Assign Manager'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const UserAudit = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error(error);
            }
        };
        load();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            alert(handleFirebaseError(error));
        }
    }

    return (
        <div>
            <h2 className="page-title">Global User Audit</h2>
            <div className="glass-panel p-6 rounded-xl">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="font-mono text-xs text-gray-500">{u.id}</td>
                                <td>
                                    <span className={`status-badge ${u.role === 'admin' ? 'status-active' : 'status-pending'}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>{u.email}</td>
                                <td>{u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300 text-xs uppercase font-bold tracking-wider">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Placeholders for 10 Modules
const PlaceholderModule = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Server size={48} opacity={0.5} />
        <h2 className="text-2xl font-bold mt-4 mb-2">{title}</h2>
        <p>System module active and monitoring.</p>
    </div>
);


const AdminDashboard = () => {
    const { userData } = useAuth();

    const menuItems = [
        { label: 'System Overview', path: '/dashboard/admin', icon: <Shield size={20} />, end: true },
        { label: 'Manage Schools', path: '/dashboard/admin/schools', icon: <PlusCircle size={20} /> },
        { label: 'User Directory', path: '/dashboard/admin/users', icon: <Users size={20} /> },
        { label: 'Database', path: '/dashboard/admin/database', icon: <Database size={20} /> },
        { label: 'Server Status', path: '/dashboard/admin/status', icon: <Server size={20} /> },
        { label: 'Mobile App', path: '/dashboard/admin/mobile', icon: <Smartphone size={20} /> },
        { label: 'Web Config', path: '/dashboard/admin/web', icon: <Globe size={20} /> },
        { label: 'System Logs', path: '/dashboard/admin/logs', icon: <FileText size={20} /> },
        { label: 'Security', path: '/dashboard/admin/security', icon: <Lock size={20} /> },
        { label: 'Alerts', path: '/dashboard/admin/alerts', icon: <AlertTriangle size={20} /> },
        { label: 'Settings', path: '/dashboard/admin/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar role="System Administrator" title="Nexus Admin" menuItems={menuItems} />
            <div className="main-content">
                <DashboardHeader />
                <Routes>
                    <Route path="/" element={<Overview user={userData} />} />
                    <Route path="/schools" element={<SchoolManagement />} />
                    <Route path="/users" element={<UserAudit />} />
                    <Route path="/database" element={<PlaceholderModule title="Database Management" />} />
                    <Route path="/status" element={<PlaceholderModule title="Server Health Status" />} />
                    <Route path="/mobile" element={<PlaceholderModule title="Mobile App Configuration" />} />
                    <Route path="/web" element={<PlaceholderModule title="Web Portal Configuration" />} />
                    <Route path="/logs" element={<PlaceholderModule title="System Logs & Audits" />} />
                    <Route path="/security" element={<PlaceholderModule title="Security Protocols" />} />
                    <Route path="/alerts" element={<PlaceholderModule title="System Alerts" />} />
                    <Route path="/settings" element={<PlaceholderModule title="Global Settings" />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;
