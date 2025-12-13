import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Menu, ArrowLeft } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ role, title, menuItems }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we're on a detail page (not the main dashboard)
    const isDetailPage = menuItems.some(item =>
        location.pathname === item.path && !item.end
    );

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleBackClick = () => {
        // Navigate back to dashboard home
        const basePath = location.pathname.split('/').slice(0, 3).join('/');
        navigate(basePath);
    };

    // Mobile: Show back button if on detail page
    if (isMobileView && isDetailPage) {
        return (
            <div className="mobile-back-header">
                <button onClick={handleBackClick} className="back-button">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
            </div>
        );
    }

    // Mobile: Show hamburger menu button
    if (isMobileView) {
        return (
            <>
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <Menu size={24} />
                </button>

                {/* Mobile Overlay Menu */}
                {isOpen && (
                    <>
                        <div className="mobile-overlay" onClick={() => setIsOpen(false)} />
                        <div className="mobile-sidebar">
                            <div className="mobile-sidebar-header">
                                <div>
                                    <h2 className="sidebar-title">{title}</h2>
                                    <p className="sidebar-role">{role}</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="mobile-close-btn"
                                    aria-label="Close menu"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="sidebar-nav">
                                {menuItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </>
                )}
            </>
        );
    }

    // Desktop: Show normal sidebar
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">{title}</h2>
                <p className="sidebar-role">{role}</p>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleNavigation(item.path)}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
