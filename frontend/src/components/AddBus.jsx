import React, { useState } from "react";
import Swal from "sweetalert2";
import API_URL from "../api/api";

export default function AddBus({ setCurrentStep }) {
    const [showModal, setShowModal] = useState(true);

    const [formData, setFormData] = useState({
        busName: "",
        busNumber: "",
        busType: "",
        source: "",
        destination: "",
        departureTime: "",
        arrivalTime: "",
        price: "",
        totalSeats: "",
        driverName: "",
        driverMobile: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 🔑 Helper to safely get Operator ID from multiple localStorage keys / JWT token
    const getOperatorId = () => {
        let opId = localStorage.getItem("operatorId") ||
            localStorage.getItem("userId") ||
            localStorage.getItem("gobus_operator_id");

        if (!opId) {
            const token = localStorage.getItem("gobus_jwt_token") || localStorage.getItem("token");
            if (token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(window.atob(base64));
                    opId = payload.id || payload._id || payload.userId;
                } catch (e) {
                    console.error("Error decoding JWT:", e);
                }
            }
        }
        return opId;
    };

    const handleSaveBus = async () => {
        const token = localStorage.getItem("gobus_jwt_token") || localStorage.getItem("token");
        const currentOpId = getOperatorId();

        if (
            !formData.busName ||
            !formData.busNumber ||
            !formData.busType ||
            !formData.source ||
            !formData.destination ||
            !formData.departureTime ||
            !formData.arrivalTime ||
            !formData.price ||
            !formData.totalSeats
        ) {
            Swal.fire(
                "Missing Fields",
                "Please fill all required fields.",
                "warning"
            );
            return;
        }

        if (!currentOpId) {
            Swal.fire("Session Error", "Operator session invalid or missing. Please re-login.", "error");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/buses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    totalSeats: Number(formData.totalSeats),
                    operatorId: currentOpId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to add bus");
            }

            Swal.fire({
                icon: "success",
                title: "Bus Added",
                text: "Your bus has been added successfully.",
                timer: 1800,
                showConfirmButton: false,
            });

            setShowModal(false);
            if (setCurrentStep) {
                setCurrentStep("dashboard");
            }

        } catch (err) {
            Swal.fire("Error", err.message, "error");
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        outline: "none",
        fontSize: "15px",
        boxSizing: "border-box",
    };

    return (
        <>
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.45)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            width: "850px",
                            background: "linear-gradient(to bottom,#ffffff,#f8fafc)",
                            borderRadius: "20px",
                            padding: "35px",
                            boxShadow: "0 25px 60px rgba(0,0,0,.25)",
                            border: "1px solid #e5e7eb",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "30px",
                            }}
                        >
                            <div style={{ fontSize: "48px" }}>🚌</div>

                            <h2
                                style={{
                                    marginTop: "10px",
                                    color: "#dc2626",
                                    fontSize: "30px",
                                    fontWeight: "700",
                                }}
                            >
                                Add New Bus
                            </h2>

                            <p
                                style={{
                                    color: "#6b7280",
                                    marginTop: "5px",
                                }}
                            >
                                Fill all the required information to register your bus.
                            </p>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "20px",
                            }}
                        >
                            <input
                                style={inputStyle}
                                type="text"
                                name="busName"
                                placeholder="🚌 Bus Name"
                                value={formData.busName}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="text"
                                name="busNumber"
                                placeholder="🔢 Bus Number"
                                value={formData.busNumber}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="text"
                                name="busType"
                                placeholder="🚍 Bus Type"
                                value={formData.busType}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="text"
                                name="source"
                                placeholder="📍 Source"
                                value={formData.source}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="text"
                                name="destination"
                                placeholder="🎯 Destination"
                                value={formData.destination}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="time"
                                name="departureTime"
                                value={formData.departureTime}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="time"
                                name="arrivalTime"
                                value={formData.arrivalTime}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="number"
                                name="price"
                                placeholder="💰 Ticket Price"
                                value={formData.price}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="number"
                                name="totalSeats"
                                placeholder="💺 Total Seats"
                                value={formData.totalSeats}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="text"
                                name="driverName"
                                placeholder="👨 Driver Name"
                                value={formData.driverName}
                                onChange={handleChange}
                            />

                            <input
                                style={inputStyle}
                                type="text"
                                name="driverMobile"
                                placeholder="📱 Driver Mobile"
                                value={formData.driverMobile}
                                onChange={handleChange}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "35px",
                            }}
                        >
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    if (setCurrentStep) setCurrentStep("dashboard");
                                }}
                                style={{
                                    padding: "14px 35px",
                                    border: "none",
                                    borderRadius: "12px",
                                    background: "#6b7280",
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "15px",
                                    cursor: "pointer",
                                    transition: "0.3s",
                                }}
                            >
                                ❌ Cancel
                            </button>

                            <button
                                onClick={handleSaveBus}
                                style={{
                                    padding: "14px 40px",
                                    border: "none",
                                    borderRadius: "12px",
                                    background:
                                        "linear-gradient(90deg,#dc2626,#ef4444)",
                                    color: "#fff",
                                    fontWeight: "700",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    boxShadow:
                                        "0 10px 25px rgba(220,38,38,.35)",
                                    transition: "0.3s",
                                }}
                            >
                                🚌 Save Bus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}