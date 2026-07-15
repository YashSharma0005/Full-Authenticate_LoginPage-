import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { handleSmartAuth } from '../services/authService';

export default function SignupPage({ setIsSignup, setView, setCurrentUser }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        let errors = {};

        if (!name.trim()) {
            errors.name = "Full Legal Name is required.";
        } else if (name.trim().length < 3) {
            errors.name = "Name must be at least 3 characters long.";
        }

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

        if (!password) {
            errors.password = "Security password is required.";
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters long.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Fix field guidelines before registering.', confirmButtonColor: '#dc2626' });
            return;
        }

        handleSmartAuth({ isSignup: true, name, email, password, setCurrentUser, setView, setIsSignup });
    };

    const handleInputChange = (field, value, setterFunc) => {
        setterFunc(value);
        if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div>
            <div style={{ marginBottom: '25px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>Create Account</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Register details inside database nodes in under 10 seconds.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Full Legal Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Enter your name"
                        value={name}
                        onChange={(e) => handleInputChange('name', e.target.value, setName)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `2px solid ${fieldErrors.name ? '#dc2626' : '#e5e7eb'}`, outline: 'none', fontSize: '14px' }}
                    />
                    {fieldErrors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ {fieldErrors.name}</span>}
                </div>

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
                            style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: '12px', border: `2px solid ${fieldErrors.password ? '#dc2626' : '#e5e7eb'}`, outline: 'none', fontSize: '14px' }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    {fieldErrors.password && <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ {fieldErrors.password}</span>}
                </div>

                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '5px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                    REGISTER FOR GOBUS
                </button>
            </form>
        </div>
    );
}