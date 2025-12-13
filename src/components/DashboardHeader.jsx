import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = () => {
    const { currentUser, userData, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        console.log('Logout button clicked');
        try {
            console.log('Calling logout function...');
            await logout();
            console.log('Logout successful, navigating to home...');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to logout: ' + error.message);
        }
    };

    const displayName = userData?.name || currentUser?.email?.split('@')[0] || 'User';
    const displayRole = userData?.role || 'Member';

    return (
        <div className="dashboard-header">
            <div className="header-welcome">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {displayName}</p>
            </div>

            <div className="header-actions">
                <div className="user-profile-card">
                    <div className="user-avatar">
                        <User size={20} />
                    </div>
                    <div className="user-info">
                        <div className="user-name">{displayName}</div>
                        <div className="user-role">{displayRole}</div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="logout-button"
                    title="Logout from system"
                    type="button"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
