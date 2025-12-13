import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Briefcase, GraduationCap, User } from 'lucide-react';
import '../index.css';
import './LandingPage.css';

const LandingPage = () => {
    const portals = [
        {
            role: 'System Admin',
            path: '/login/admin',
            icon: <Shield size={40} />,
            desc: 'System Configuration & Monitoring'
        },
        {
            role: 'Management',
            path: '/login/management',
            icon: <Briefcase size={40} />,
            desc: 'School Administration & Reports'
        },
        {
            role: 'Teacher',
            path: '/login/teacher',
            icon: <User size={40} />,
            desc: 'Classroom & Student Management'
        },
        {
            role: 'Student',
            path: '/login/student',
            icon: <GraduationCap size={40} />,
            desc: 'Learning, Grades & Attendance'
        },
    ];

    return (
        <div className="landing-container">
            {/* Background Decor */}
            <div className="bg-decor-wrapper">
                <div className="bg-blob blob-1"></div>
                <div className="bg-blob blob-2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="hero-section"
            >
                <h1 className="hero-title">
                    Nexus SMS
                </h1>
                <p className="hero-subtitle">
                    The next-generation School Management System designed for speed, security, and simplicity.
                </p>
            </motion.div>

            <div className="portals-grid">
                {portals.map((portal, index) => (
                    <motion.div
                        key={portal.role}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="portal-card-wrapper"
                    >
                        <Link to={portal.path} className="portal-link group">
                            <div className="glass-panel portal-card">
                                <div className={`icon-wrapper gradient-${index}`}>
                                    <div className="icon">
                                        {portal.icon}
                                    </div>
                                </div>
                                <h2 className="portal-title">{portal.role}</h2>
                                <p className="portal-desc">
                                    {portal.desc}
                                </p>
                                <div className="portal-action">
                                    <span className="btn-link">
                                        Login Portal &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <footer className="landing-footer flex flex-col items-center gap-2">
                <p>&copy; 2024 Nexus School Management System</p>
                <Link to="/setup" style={{ opacity: 0.3, fontSize: '0.8rem', textDecoration: 'none', color: 'inherit' }}>Initialize System</Link>
            </footer>
        </div>
    );
};

export default LandingPage;
