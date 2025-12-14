import React, { useState } from 'react';
import { supabase } from '../supabase/config';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const AdminSignup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        secretKey: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Secret key to prevent unauthorized admin creation
    const ADMIN_SECRET_KEY = 'SCHOOL_ADMIN_2024'; // Change this to your own secret

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate secret key
        if (formData.secretKey !== ADMIN_SECRET_KEY) {
            setError('Invalid secret key. Admin signup is restricted.');
            return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // 1. Create admin user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        role: 'admin'
                    }
                }
            });

            if (authError) throw authError;

            // 2. Create admin record in users table
            const { error: dbError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: formData.email,
                    name: formData.name,
                    role: 'admin',
                    status: 'active',
                    created_at: new Date().toISOString()
                });

            if (dbError) throw dbError;

            alert('✅ Admin account created successfully! You can now login.');
            navigate('/login/admin');

        } catch (error) {
            console.error('Signup error:', error);
            setError(error.message || 'Failed to create admin account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Admin Signup</h1>
                    <p>Create your admin account</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        color: '#c33'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="admin@school.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Minimum 6 characters"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Re-enter password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Secret Key</label>
                        <input
                            type="password"
                            name="secretKey"
                            value={formData.secretKey}
                            onChange={handleChange}
                            required
                            placeholder="Enter admin secret key"
                        />
                        <small style={{ color: '#666', fontSize: '12px' }}>
                            Contact IT department for the secret key
                        </small>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Admin Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <a
                        href="/login/admin"
                        style={{ color: '#667eea', textDecoration: 'none' }}
                    >
                        Already have an account? Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
