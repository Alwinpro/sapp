import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import '../index.css';
import './LoginPage.css';

const LoginPage = ({ role }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            // AuthContext will handle state, but we can double check component side if needed.
            // Navigation is handled by ProtectedRoute mostly, but better to push here too.
            navigate(`/dashboard/${role}`);
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
            console.error(err);
        }
        setLoading(false);
    };

    const roleTitles = {
        admin: 'System Admin',
        management: 'School Management',
        teacher: 'Teacher Portal',
        student: 'Student Portal'
    };

    const roleColors = {
        admin: 'admin-glow',
        management: 'management-glow',
        teacher: 'teacher-glow',
        student: 'student-glow'
    };

    return (
        <div className="login-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="login-card glass-panel"
            >
                <button className="back-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} /> Back
                </button>

                <div className={`login-header ${roleColors[role]}`}>
                    <h1>{roleTitles[role]}</h1>
                    <p>Login to your dashboard</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@school.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Access Dashboard'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Forgot password? Contact IT Support.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
