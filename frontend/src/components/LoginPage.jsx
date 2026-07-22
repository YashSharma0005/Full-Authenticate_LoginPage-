import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { handleSmartAuth } from "../services/authService";
import {
    loginWithGoogle,
    loginWithFacebook,
    loginWithGithub,
    loginWithApple
} from "../services/socialAuth";

import {
    FaGoogle,
    FaFacebookF,
    FaGithub,
    FaApple,
    //   FaPhone
} from "react-icons/fa";

export default function LoginPage({
    setIsSignup,
    setView,
    setCurrentUser
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const socialBtnStyle = {
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        border: "2px solid #e5e7eb",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "0.3s",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let errors = {};

        const cleanEmailMobile = email.trim();

        if (!cleanEmailMobile) {
            errors.email =
                "Email Address or Mobile Number is required.";
        } else {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            const indianMobileRegex =
                /^[6-9]\d{9}$/;

            if (
                !emailRegex.test(cleanEmailMobile) &&
                !indianMobileRegex.test(cleanEmailMobile)
            ) {
                errors.email =
                    "Enter a valid email address or 10-digit mobile number.";
            }
        }

        if (!password) {
            errors.password =
                "Security password is required.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);

            Swal.fire({
                icon: "error",
                title: "Validation Error",
                text: "Fix fields before logging in.",
                confirmButtonColor: "#dc2626"
            });

            return;
        }

        handleSmartAuth({
            isSignup: false,
            email,
            password,
            setCurrentUser,
            setView,
            setIsSignup
        });
    };

    const handleInputChange = (
        field,
        value,
        setterFunc
    ) => {
        setterFunc(value);

        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({
                ...prev,
                [field]: null
            }));
        }
    };

    return (
        <div>
            <div style={{ marginBottom: "25px" }}>
                <h2
                    style={{
                        fontSize: "26px",
                        fontWeight: "700",
                        color: "#111827",
                        margin: "0 0 6px 0"
                    }}
                >
                    Sign In To Your Profile
                </h2>

                <p
                    style={{
                        margin: 0,
                        fontSize: "13.5px",
                        color: "#6b7280"
                    }}
                >
                    Smart system connected dynamically to database schemas.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                noValidate
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px"
                }}
            >
                {/* EMAIL */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}
                >
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#4b5563"
                        }}
                    >
                        Email Address / Mobile Number
                    </label>

                    <input
                        type="text"
                        placeholder="name@domain.com or 10-digit number"
                        value={email}
                        onChange={(e) =>
                            handleInputChange(
                                "email",
                                e.target.value,
                                setEmail
                            )
                        }
                        style={{
                            width: "94%",
                            padding: "12px 5px",
                            borderRadius: "12px",
                            border: `2px solid ${fieldErrors.email
                                ? "#dc2626"
                                : "#e5e7eb"
                                }`,
                            outline: "none",
                            fontSize: "14px"
                        }}
                    />

                    {fieldErrors.email && (
                        <span
                            style={{
                                color: "#dc2626",
                                fontSize: "12px"
                            }}
                        >
                            ⚠️ {fieldErrors.email}
                        </span>
                    )}
                </div>

                {/* PASSWORD */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}
                >
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#4b5563"
                        }}
                    >
                        Security Password
                    </label>

                    <div
                        style={{
                            position: "relative"
                        }}
                    >
                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Enter the Password"
                            value={password}
                            onChange={(e) =>
                                handleInputChange(
                                    "password",
                                    e.target.value,
                                    setPassword
                                )
                            }
                            style={{
                                width: "93%",
                                padding:
                                    "12px 6px 12px 6px",
                                borderRadius: "12px",
                                border: `2px solid ${fieldErrors.password
                                    ? "#dc2626"
                                    : "#e5e7eb"
                                    }`,
                                outline: "none",
                                fontSize: "14px"
                            }}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                            style={{
                                position: "absolute",
                                right: "16px",
                                top: "50%",
                                transform:
                                    "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            {showPassword
                                ? "🙈"
                                : "👁️"}
                        </button>
                    </div>

                    {fieldErrors.password && (
                        <span
                            style={{
                                color: "#dc2626",
                                fontSize: "12px"
                            }}
                        >
                            ⚠️ {fieldErrors.password}
                        </span>
                    )}
                </div>

                {/* FORGOT PASSWORD */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end"
                    }}
                >
                    <button
                        type="button"
                        onClick={() => {
                            window.location.hash =
                                "#/forgot";
                            setView("forgot");
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#dc2626",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Forgot Password?
                    </button>
                </div>

                {/* LOGIN BUTTON */}
                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: "pointer",
                        marginTop: "5px",
                        boxShadow:
                            "0 4px 6px -1px rgba(220,38,38,0.2)"
                    }}
                >
                    PROCEED SECURELY
                </button>

                {/* SOCIAL LOGIN */}
                <div
                    style={{
                        marginTop: "10px",
                        textAlign: "center"
                    }}
                >
                    <p
                        style={{
                            color: "#6b7280",
                            fontSize: "13px",
                            marginBottom: "18px"
                        }}
                    >
                        Or continue with
                    </p>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "16px",
                            flexWrap: "wrap"
                        }}
                    >
                        {/* GOOGLE */}
                        <button
                            type="button"
                            style={socialBtnStyle}
                            onClick={async () => {
                                try {
                                    const result =
                                        await loginWithGoogle();

                                    console.log(result.user);
                                    setCurrentUser(result.user);
                                    setView("dashboard");
                                } catch (err) {
                                    console.log(err);
                                }
                            }}
                        >
                            <FaGoogle size={20} color="#EA4335" />
                        </button>

                        {/* FACEBOOK */}
                        <button
                            type="button"
                            style={socialBtnStyle}
                            onClick={async () => {
                                try {
                                    const result =
                                        await loginWithFacebook();

                                    console.log(result.user);
                                    setCurrentUser(result.user);
                                    setView("dashboard");
                                } catch (err) {
                                    console.log(err);
                                }
                            }}
                        >
                            <FaFacebookF size={20} color="#1877F2" />
                        </button>

                        {/* GITHUB */}
                        <button
                            type="button"
                            style={socialBtnStyle}
                            onClick={async () => {
                                try {
                                    const result =
                                        await loginWithGithub();

                                    console.log(result.user);
                                    setCurrentUser(result.user);
                                    setView("dashboard");
                                } catch (err) {
                                    console.log(err);
                                }
                            }}
                        >
                            <FaGithub size={20} />
                        </button>

                        {/* APPLE */}
                        <button
                            type="button"
                            style={socialBtnStyle}
                            onClick={async () => {
                                try {
                                    const result =
                                        await loginWithApple();

                                    console.log(result.user);
                                    setCurrentUser(result.user);
                                    setView("dashboard");
                                } catch (err) {
                                    console.log(err);
                                }
                            }}
                        >
                            <FaApple size={20} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}