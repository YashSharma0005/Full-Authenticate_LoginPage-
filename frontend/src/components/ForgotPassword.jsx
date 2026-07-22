import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { sendResetLink } from "../services/firebaseAuth";

export default function ForgotPassword({ setView }) {

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOtpField, setShowOtpField] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  useEffect(() => {
    let interval;

    if (showOtpField && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, showOtpField]);

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-Password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP sent successfully");
        setSeverity("success");
        setOpenSnackbar(true);

        setShowOtpField(true);
        setTimer(60);
        setCanResend(false);
      } else {
        setMessage(data.message || "OTP failed");
        setSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setMessage("Server connection failed");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            otp
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP Verified Successfully");
        setSeverity("success");
        setOpenSnackbar(true);

        setOtpVerified(true);
        setShowOtpField(false);
      } else {
        setMessage(data.message);
        setSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setMessage("Server connection failed");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleResendOtp = async () => {
    setTimer(60);
    setCanResend(false);
    await handleSendOtp();
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("Please fill all fields");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password: newPassword
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Password Updated Successfully");
        setSeverity("success");
        setOpenSnackbar(true);

        setTimeout(() => {
          setView("auth");
        }, 1500);
      } else {
        setMessage(data.message);
        setSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setMessage("Server connection failed");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#fff",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "30px",
            fontWeight: "800"
          }}
        >
          Forgot Password
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={otpVerified}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            marginTop: "25px",
            borderRadius: "12px",
            border: "2px solid #ddd",
            background: otpVerified ? "#f3f4f6" : "#fff"

          }}
        />

        {/* SEND OTP */}
        {!showOtpField && !otpVerified && (
          <button
            onClick={handleSendOtp}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            SEND OTP
          </button>
        )}

        {/* OTP SECTION */}
        {showOtpField && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "20px",
                borderRadius: "12px",
                border: "2px solid #ddd"
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px"
              }}
            >
              <button
                onClick={handleVerifyOtp}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px"
                }}
              >
                VERIFY OTP
              </button>

              <button
                onClick={handleResendOtp}
                disabled={!canResend}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: canResend
                    ? "#2563eb"
                    : "#9ca3af",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px"
                }}
              >
                {canResend
                  ? "RESEND OTP"
                  : `RESEND IN ${timer}s`}
              </button>
            </div>
          </>
        )}

        {/* PASSWORD SECTION */}
        {otpVerified && (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "20px",
                borderRadius: "12px",
                border: "2px solid #ddd"
              }}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "20px",
                borderRadius: "12px",
                border: "2px solid #ddd"
              }}
            />

            <button
              onClick={handleResetPassword}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "14px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "12px"
              }}
            >
              UPDATE PASSWORD
            </button>
          </>
        )}
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          severity={severity}
          variant="filled"
          onClose={() => setOpenSnackbar(false)}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}