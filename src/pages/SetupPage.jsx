import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSystemInitialized, createSystemAdmin } from '../services/setupService';
import { Shield, Lock, User, Mail, CheckCircle, Server } from 'lucide-react';
import '../index.css';
import './LoginPage.css'; // Reusing login styles for consistency

const SetupPage = () => {
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkInit = async () => {
            const exists = await checkSystemInitialized();
            if (exists) {
                setInitialized(true);
                // If already initialized, redirect to home/login after a brief moment or immediately
                // allowing user to see status if they navigated here manually
            }
            setLoading(false);
        };
        checkInit();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password should be at least 6 characters");
            return;
        }

        setIsSubmitting(true);
        try {
            await createSystemAdmin(formData.email, formData.password, formData.name);
            alert("System Administrator Created Successfully! Redirecting to Login...");
            navigate('/login/admin');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p>Checking System Status...</p>
            </div>
        );
    }

    if (initialized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-green-500/20 text-green-400">
                            <CheckCircle size={48} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">System Initialized</h1>
                    <p className="text-gray-400 mb-8">
                        A System Administrator has already been configured. For security reasons, this setup page is now disabled.
                    </p>
                    <button onClick={() => navigate('/')} className="btn btn-primary w-full">
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card glass-panel relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4 text-white">
                        <Server size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">System Setup</h1>
                    <p className="text-gray-400 text-sm">Create the root Administrator account for Nexus SMS.</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form relative z-10">
                    <div className="form-group">
                        <label>Admin Name</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="System Administrator"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="admin@school.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    className="input-field"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    placeholder="••••••"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Confirm</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    className="input-field"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    placeholder="••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={isSubmitting}>
                        {isSubmitting ? 'Configuring System...' : 'Initialize System'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupPage;
