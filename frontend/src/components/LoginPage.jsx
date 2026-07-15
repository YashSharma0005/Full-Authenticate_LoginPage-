import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { handleSmartAuth } from "../services/authService";

export default function LoginPage({ setIsSignup, setView, setCurrentUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        let errors = {};

        const cleanEmailMobile = email.trim();
        if (!cleanEmailMobile) {
            errors.email = "Email Address or Mobile Number is required.";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const indianMobileRegex = /^[6-9]\d{9}$/;
            if (!emailRegex.test(cleanEmailMobile) && !indianMobileRegex.test(cleanEmailMobile)) {
                errors.email = "Enter a valid email address or 10-digit mobile number.";
            }
        }

        if (!password) errors.password = "Security password is required.";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Fix fields before logging in.', confirmButtonColor: '#dc2626' });
            return;
        }

        handleSmartAuth({ isSignup: false, email, password, setCurrentUser, setView, setIsSignup });
    };

    const handleInputChange = (field, value, setterFunc) => {
        setterFunc(value);
        if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div>
            <div style={{ marginBottom: '25px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>Sign In To Your Profile</h2>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#6b7280' }}>Smart system connected dynamically to database schemas.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Email Address / Mobile Number</label>
                    <input
                        type="text"
                        placeholder="name@domain.com or 10-digit number"
                        value={email}
                        onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `2px solid ${fieldErrors.email ? '#dc2626' : '#e5e7eb'}`, outline: 'none', fontSize: '14px' }}
                    />
                    {fieldErrors.email && <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ {fieldErrors.email}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Security Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter the Password"
                            value={password}
                            onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                            style={{ width: '93%', padding: '12px 48px 12px 16px', borderRadius: '12px', border: `2px solid ${fieldErrors.password ? '#dc2626' : '#e5e7eb'}`, outline: 'none', fontSize: '14px' }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    {fieldErrors.password && <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ {fieldErrors.password}</span>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => {
                            window.location.hash = '#/forgot';
                            setView('forgot');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Forgot Password?
                    </button>
                </div>

                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '5px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                    PROCEED SECURELY
                </button>
            </form>
        </div>
    );
}