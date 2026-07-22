import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function RegisterOperator({ onBackToDashboard, onRegisterSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            Swal.fire('Password Mismatch', 'Passwords do not match!', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/operators/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to register operator");
            }

            Swal.fire({
                icon: 'success',
                title: 'Operator Account Created!',
                text: 'Aapka operator account successfully create ho gaya hai. Ab aap login kar sakte hain.',
                confirmButtonColor: '#059669'
            });

            if (onRegisterSuccess) {
                onRegisterSuccess(data);
            } else {
                onBackToDashboard();
            }

        } catch (error) {
            Swal.fire('Registration Error', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: "480px",
            margin: "40px auto",
            padding: "32px",
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <span style={{
                    background: "#ecfdf5",
                    color: "#059669",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "800"
                }}>
                    🛠️ OPERATOR REGISTRATION
                </span>
                <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginTop: "12px", marginBottom: "6px" }}>
                    Create Operator Partner Account
                </h2>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                    Register your fleet business to manage routes and seats.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                        Operator / Agency Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="e.g. Royal Travels Pvt Ltd"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                        Official Unique Email ID
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="operator@domain.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                        Operator Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: "10px",
                        padding: "14px",
                        background: "linear-gradient(135deg, #059669, #047857)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "800",
                        fontSize: "14px",
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 16px rgba(5,150,105,0.3)"
                    }}
                >
                    {loading ? "Registering in DB..." : "Create Operator ID"}
                </button>
            </form>

            <button
                type="button"
                onClick={onBackToDashboard}
                style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "10px",
                    background: "transparent",
                    color: "#64748b",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer"
                }}
            >
                ← Back to Passenger Portal
            </button>
        </div>
    );
}