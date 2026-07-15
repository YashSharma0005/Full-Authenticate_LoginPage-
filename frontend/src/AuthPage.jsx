import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

export default function AuthPage({ isSignup, setIsSignup, setView, setCurrentUser }) {
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

    // Dynamic resize handler for responsive structural modifications
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="auth-view-viewport" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: isMobile ? '10px' : '20px' }}>
            <div className="auth-split-box-card" style={{ 
                display: 'flex', flexDirection: isMobile ? 'column' : 'row', 
                width: isMobile ? '100%' : '900px', maxWidth: '100%', 
                backgroundColor: '#ffffff', borderRadius: isMobile ? '16px' : '24px', 
                overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
            }}>

                {/* LEFT BRAND PANEL (Hides detailed text blocks automatically if on phone layout) */}
                <div className="auth-left-brand-panel" style={{ 
                    backgroundColor: '#dc2626', color: '#ffffff', 
                    width: isMobile ? '100%' : '40%', padding: isMobile ? '20px' : '40px', 
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', 
                    textAlign: isMobile ? 'center' : 'left' 
                }}>
                    <div style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', letterSpacing: '-1px' }}>gobus</div>
                    
                    {!isMobile && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', margin: '20px 0' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>⚡</span>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Lightning Fast</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#fee2e2' }}>Verify and process system triggers instantly.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>🛡️</span>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Secure Engine</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#fee2e2' }}>MongoDB databases locked under secure standard token models.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isMobile && <div style={{ fontSize: '11px', color: '#fee2e2', opacity: 0.8 }}>© 2026 GOBUS Shell Integration Engine.</div>}
                </div>

                {/* RIGHT PANEL - DYNAMIC RENDERING SLOTS */}
                <div className="auth-right-form-panel" style={{ width: isMobile ? '100%' : '60%', padding: isMobile ? '30px 20px' : '50px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    
                    {isSignup ? (
                        <SignupPage setIsSignup={setIsSignup} setView={setView} setCurrentUser={setCurrentUser} />
                    ) : (
                        <LoginPage setIsSignup={setIsSignup} setView={setView} setCurrentUser={setCurrentUser} />
                    )}

                    {/* SHARED LAYOUT TOGGLE LINK STRINGS */}
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => setIsSignup(!isSignup)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: '700', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
                        >
                            {isSignup ? 'Want to Login instead?' : 'Create an Account instead?'}
                        </button>
                        <br /><br />
                        <button type="button" onClick={() => setView('dashboard')} style={{ background: 'none', border: 'none', color: '#4b5563', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                            ← Continue exploring as Guest
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}