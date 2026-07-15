import VerifyOtp from './components/VerifyOtp';
import React, { useState, useEffect } from 'react';
import Auth from './AuthPage';
import Dashboard from './Dashboard';
import ForgotPassword from './components/ForgotPassword';


export default function App() {
    const [view, setView] = useState('auth');
    const [isSignup, setIsSignup] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [otpEmail, setOtpEmail] = useState("");

    useEffect(() => {
        const handleRouteGuard = () => {
            const token = localStorage.getItem('gobus_jwt_token');
            const currentHash = window.location.hash;

            if (
                !token &&
                currentHash !== '#/auth' &&
                currentHash !== '#/forgot' &&
                currentHash !== '#/verifyOtp'
            ) {
            }
            else if (token && (currentHash === '#/auth' || currentHash === '')) {
                window.location.hash = '#/dashboard';
                setView('dashboard');
            }
        };

        handleRouteGuard();

        window.addEventListener('hashchange', handleRouteGuard);

        return () =>
            window.removeEventListener('hashchange', handleRouteGuard);
    }, []);

    return (
        <>
            {view === 'auth' ? (

                <Auth
                    isSignup={isSignup}
                    setIsSignup={setIsSignup}
                    setView={setView}
                    setCurrentUser={setCurrentUser}
                />

            ) : view === 'forgot' ? (

                <ForgotPassword
                    setView={setView}
                    setOtpEmail={setOtpEmail}
                />

            ) : view === 'verifyOtp' ? (

                <VerifyOtp
                    email={otpEmail}
                    setView={setView}
                />

            ) : (

                <div className="app-container">
                    <Dashboard setView={setView} />
                </div>

            )}
        </>
    );
}