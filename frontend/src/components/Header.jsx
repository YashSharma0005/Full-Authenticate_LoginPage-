import React from 'react';

export default function Header({ view, setView, setIsSignup, currentUser, setCurrentUser }) {

    const handleLogout = () => {
        localStorage.removeItem('gobus_jwt_token');
        localStorage.removeItem('gobus_user_profile');
        setCurrentUser(null);
        setView('dashboard');
    };

    return (
        <header className="main-site-header">
            <div className="header-left-block">
                <div className="brand-logo-red" onClick={() => setView('dashboard')}>
                    gobus
                </div>
                <div className="trust-seal-badge">
                    <span className="seal-stars">🏆</span>
                    <div className="seal-text-stack">
                        <span className="seal-title">Trusted by</span>
                        <span className="seal-count">5 Crore+ Indians</span>
                    </div>
                </div>
            </div>

            <div className="header-right-utilities">
                <a href="#offers" className="nav-utility-link" onClick={() => setView('dashboard')}>
                    <span className="util-icon">🏷️</span> <span className="util-text">Offers</span>
                </a>
                <a href="#track" className="nav-utility-link">
                    <span className="util-icon">📍</span> <span className="util-text">Track Ticket</span>
                </a>
                <a href="#help" className="nav-utility-link">
                    <span className="util-icon">❔</span> <span className="util-text">Need Help?</span>
                </a>

                {currentUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            👤 Hi, {currentUser.name.split(' ')[0]}
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                color: '#4b5563'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        className={`nav-utility-link login-profile-trigger-btn ${view === 'login' ? 'active-view' : ''}`}
                        onClick={() => { setView('login'); setIsSignup(false); }}
                    >
                        <span className="util-icon">👤</span> <span className="util-text">Login/SignUp</span>
                    </button>
                )}
            </div>
        </header>
    );
}