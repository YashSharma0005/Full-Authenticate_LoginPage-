import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API_URL from "../api/api";
import AddBus from "./AddBus";

export default function OperatorDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState("bookings");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const operatorName = localStorage.getItem("gobus_operator_name") || localStorage.getItem("name") || "Operator Partner";

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

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("gobus_jwt_token") || localStorage.getItem("token");
            const currentOpId = getOperatorId();

            const url = currentOpId
                ? `${API_URL}/api/bookings/all?operatorId=${currentOpId}`
                : `${API_URL}/api/bookings/all`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                const bookingList = data.data || data.bookings || (Array.isArray(data) ? data : []);
                setBookings(bookingList);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "bookings") {
            fetchBookings();
        }
    }, [activeTab]);

    const displayedBookings = bookings.filter((item) => {
        const passengerName = (item.passengerName || item.userId?.name || "").toLowerCase();
        const busName = (item.busId?.busName || "").toLowerCase();
        const bookingId = (item._id || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        return passengerName.includes(search) || busName.includes(search) || bookingId.includes(search);
    });

    return (
        <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', sans-serif" }}>
            <nav style={{
                background: "#0f172a", color: "#fff", padding: "16px 32px",
                display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "28px" }}>🚍</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#10b981" }}>GoBus Fleet Operator</h2>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Welcome, {operatorName}</span>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={() => setActiveTab("bookings")}
                        style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: activeTab === "bookings" ? "#10b981" : "#334155", color: "#fff", fontWeight: "700", cursor: "pointer" }}
                    >
                        📋 Passenger Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab("addBus")}
                        style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: activeTab === "addBus" ? "#dc2626" : "#334155", color: "#fff", fontWeight: "700", cursor: "pointer" }}
                    >
                        ➕ Add New Bus
                    </button>
                    <button
                        onClick={onLogout}
                        style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontWeight: "700", cursor: "pointer" }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
                {activeTab === "bookings" && (
                    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Your Fleet Passenger Bookings</h3>
                                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>Showing bookings reserved strictly for your operated buses.</p>
                            </div>
                            <button onClick={fetchBookings} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                                🔄 Refresh List
                            </button>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <input
                                type="text"
                                placeholder="🔍 Search Passenger Name, Bus Name, or Booking ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                            />
                        </div>

                        {loading ? (
                            <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading booking records...</p>
                        ) : displayedBookings.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "50px", color: "#94a3b8" }}>
                                <span style={{ fontSize: "40px" }}>🎫</span>
                                <p style={{ marginTop: "10px", fontSize: "16px" }}>No passenger bookings found for your buses.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                                    <thead>
                                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#334155" }}>
                                            <th style={{ padding: "14px" }}>Booking ID</th>
                                            <th style={{ padding: "14px" }}>Passenger Details</th>
                                            <th style={{ padding: "14px" }}>Bus Details</th>
                                            <th style={{ padding: "14px" }}>Route</th>
                                            <th style={{ padding: "14px" }}>Seats</th>
                                            <th style={{ padding: "14px" }}>Amount</th>
                                            <th style={{ padding: "14px" }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedBookings.map((item, idx) => (
                                            <tr key={item._id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                <td style={{ padding: "14px", fontWeight: "700", color: "#0284c7" }}>#{item._id ? item._id.slice(-6).toUpperCase() : `BK-${idx + 1}`}</td>
                                                <td style={{ padding: "14px" }}>
                                                    <strong>{item.passengerName || item.userId?.name || "Passenger"}</strong><br />
                                                    <span style={{ fontSize: "12px", color: "#64748b" }}>{item.userId?.email || item.userId?.mobile || "N/A"}</span>
                                                </td>
                                                <td style={{ padding: "14px" }}>
                                                    <strong>{item.busId?.busName || "Express Bus"}</strong><br />
                                                    <span style={{ fontSize: "12px", color: "#64748b" }}>{item.busId?.busNumber || "N/A"}</span>
                                                </td>
                                                <td style={{ padding: "14px" }}>{item.busId?.source || "Origin"} ➔ {item.busId?.destination || "Destination"}</td>
                                                <td style={{ padding: "14px", fontWeight: "700", color: "#059669" }}>
                                                    {Array.isArray(item.seatNumber) ? item.seatNumber.join(", ") : item.seatNumber || "1"}
                                                </td>
                                                <td style={{ padding: "14px", fontWeight: "800", color: "#0f172a" }}>₹{item.farePaid || item.busId?.price || 0}</td>
                                                <td style={{ padding: "14px" }}>
                                                    <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                                                        {item.bookingStatus ? item.bookingStatus.toUpperCase() : "CONFIRMED"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "addBus" && (
                    <AddBus setCurrentStep={(step) => {
                        if (step === "dashboard" || step === "operatorDashboard") {
                            setActiveTab("bookings");
                            fetchBookings();
                        }
                    }} />
                )}
            </div>
        </div>
    );
}