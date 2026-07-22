import React, { useState, useEffect } from 'react';
import AddBus from "./components/AddBus";
import API_URL from "./api/api";
import Swal from 'sweetalert2';
import LiveTracking from "./components/LiveTracking";
import RegisterOperator from "./components/RegisterOperator";
import OperatorDashboard from "./components/OperatorDashboard";

// Standard Indian Popular Transport Cities List
const CITIES_LIST = [
    "Delhi", "Jaipur", "Agra", "Mumbai", "Pune", "Ahmedabad",
    "Bengaluru", "Hyderabad", "Chennai", "Chandigarh", "Lucknow",
    "Varanasi", "Dehradun", "Indore", "Bhopal", "Kolkata", "Noida", "Gurugram"
];

export default function Dashboard({ setView }) {
    const token = localStorage.getItem("gobus_jwt_token");
    const [buses, setBuses] = useState([]);

    // Auth & Role State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "passenger"); // 'passenger' | 'operator'
    const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

    // App Flow States
    const [currentStep, setCurrentStep] = useState('dashboard'); // 'dashboard' | 'results' | 'seats' | 'tracking' | 'addBus'

    // Form Inputs
    const [leavingFrom, setLeavingFrom] = useState('');
    const [goingTo, setGoingTo] = useState('');
    const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);

    // Booking Data States  
    const [selectedBus, setSelectedBus] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [alreadyBookedSeats, setAlreadyBookedSeats] = useState(['A3', 'B2', 'C1', 'C2']);

    // Mock/Backend API Fetching Buses
    useEffect(() => {
        fetch(`${API_URL || "http://localhost:5000"}/api/buses`)
            .then(res => res.json())
            .then(data => {
                setBuses(data.data || data || []);
            })
            .catch(err => {
                console.log("Error loading buses:", err);
            });
    }, []);

    // Auth Check on Mount
    useEffect(() => {
        const storedToken = localStorage.getItem('gobus_jwt_token');
        if (storedToken) {
            setIsLoggedIn(true);
            if (!userName) {
                const storedName = localStorage.getItem("userName");
                if (storedName) setUserName(storedName);
            }
        } else {
            setIsLoggedIn(false);
        }
    }, [userName]);

    // 🔒 GUARD CHECK: Agar user Operator hai toh direct Dedicated Operator Portal render karein
    if (userRole === "operator") {
        return (
            <OperatorDashboard 
                onLogout={() => {
                    localStorage.removeItem("userRole");
                    localStorage.removeItem("gobus_jwt_token");
                    localStorage.removeItem("userName");
                    localStorage.removeItem("gobus_operator_name");
                    setIsLoggedIn(false);
                    setUserRole("passenger");
                    setCurrentStep("dashboard");
                }} 
            />
        );
    }

    // Handle Logout (For Passenger)
    const handleLogout = () => {
        Swal.fire({
            title: 'Logout Confirmation',
            text: 'Are you sure you want to sign out from GoBus?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Logout'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('gobus_jwt_token');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole');
                setIsLoggedIn(false);
                setUserName('');
                setUserRole("passenger");
                Swal.fire('Logged Out', 'You have been safely signed out.', 'success');
            }
        });
    };

    // 🔒 SECURE OPERATOR SWITCH WITH DEDICATED AUTHENTICATION
    const handleSwitchRole = (targetRole, defaultEmail = '') => {
        if (targetRole === userRole && !defaultEmail) return;

        if (targetRole === 'operator') {
            Swal.fire({
                title: '🔑 Fleet Operator Authentication',
                html: `
                <p style="font-size:13px; color:#64748b; margin-bottom:12px;">Enter your Operator Email & Password to access Fleet Portal.</p>
                <input type="email" id="op_email" class="swal2-input" placeholder="Operator Registered Email" value="${defaultEmail}">
                <input type="password" id="op_pass" class="swal2-input" placeholder="Operator Password">
                <div style="margin-top: 15px; font-size: 13px;">
                    <span>Don't have an operator account? </span>
                    <a href="#" id="create_op_link" style="color:#059669; font-weight:bold; text-decoration:underline;">Create Operator ID</a>
                </div>
            `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Login as Operator',
                confirmButtonColor: '#059669',
                didOpen: () => {
                    const createLink = Swal.getPopup().querySelector('#create_op_link');
                    if (createLink) {
                        createLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            Swal.close();
                            setCurrentStep('registerOperator');
                        });
                    }
                },
                preConfirm: async () => {
                    const email = Swal.getPopup().querySelector('#op_email').value;
                    const password = Swal.getPopup().querySelector('#op_pass').value;

                    if (!email || !password) {
                        Swal.showValidationMessage(`Please fill both Email & Password`);
                        return false;
                    }

                    try {
                        const res = await fetch(`${API_URL || "http://localhost:5000"}/api/operators/login`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password })
                        });
                        const data = await res.json();

                        if (!res.ok) {
                            Swal.showValidationMessage(data.message || "Invalid Operator Credentials");
                            return false;
                        }

                        return data;
                    } catch (err) {
                        Swal.showValidationMessage("Server error during operator authentication");
                        return false;
                    }
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    setUserRole('operator');
                    setUserName(result.value.operatorName || "Operator Partner");
                    localStorage.setItem("userRole", 'operator');
                    localStorage.setItem("gobus_operator_name", result.value.operatorName || "Operator Partner");
                    localStorage.setItem("gobus_jwt_token", result.value.token);

                    Swal.fire({
                        icon: 'success',
                        title: 'Operator Access Granted',
                        text: `Welcome Back! You are in Operator Panel.`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            });
        } else {
            setUserRole('passenger');
            localStorage.setItem("userRole", 'passenger');
            setCurrentStep('dashboard');
        }
    };

    // Auth Interceptor Guard
    const checkAuthAndProceed = (actionCallback) => {
        if (!isLoggedIn) {
            Swal.fire({
                title: 'Authentication Required',
                text: 'Please sign in to reserve seats or manage operator settings.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Login / Signup',
                confirmButtonColor: '#e11d48',
            }).then((result) => {
                if (result.isConfirmed && setView) setView('auth');
            });
            return false;
        }
        if (actionCallback) actionCallback();
        return true;
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!leavingFrom || !goingTo) {
            Swal.fire('Missing Information', 'Please enter both source and destination cities.', 'warning');
            return;
        }
        setCurrentStep('results');
    };

    const handleSelectBus = (bus) => {
        setSelectedBus(bus);
        setSelectedSeats([]);
        setCurrentStep('seats');
    };

    const toggleSeatSelection = (seatId) => {
        if (alreadyBookedSeats.includes(seatId)) {
            Swal.fire('Seat Reserved', 'This seat is already occupied by another passenger.', 'error');
            return;
        }
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(prev => prev.filter(s => s !== seatId));
        } else {
            setSelectedSeats(prev => [...prev, seatId]);
        }
    };

    // 🛠️ BACKEND SYNCED CHECKOUT & BOOKING CREATION WITH PASSENGER NAME INPUT
    const handleCheckoutPayment = async () => {
        checkAuthAndProceed(async () => {
            if (selectedSeats.length === 0) {
                Swal.fire("Select Seats", "Please select at least 1 seat to proceed.", "info");
                return;
            }

            // Passenger Name Prompt
            const { value: passengerInputName } = await Swal.fire({
                title: 'Passenger Details',
                html: `<p style="font-size:13px; color:#64748b; margin-bottom:10px;">Enter Full Passenger Name for ticket generation & Operator record:</p>
                       <input id="p_name" class="swal2-input" placeholder="Full Passenger Name" value="${userName || ''}">`,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Proceed to Pay',
                confirmButtonColor: '#e11d48',
                preConfirm: () => {
                    const input = document.getElementById('p_name').value;
                    if (!input || !input.trim()) {
                        Swal.showValidationMessage('Please enter passenger name');
                        return false;
                    }
                    return input.trim();
                }
            });

            if (!passengerInputName) return;

            // Update Name in localStorage & State if not set
            if (!userName) {
                setUserName(passengerInputName);
                localStorage.setItem("userName", passengerInputName);
            }

            try {
                Swal.fire({
                    title: "Processing Reservation",
                    text: "Saving booking details into operator database...",
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                // Backend Sync: Loop through seats and save to Database so Operator Portal can fetch it
                for (let seat of selectedSeats) {
                    const response = await fetch(`${API_URL || "http://localhost:5000"}/api/bookings/book-seat`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            busId: selectedBus._id,
                            passengerName: passengerInputName,
                            seatNumber: seat,
                            journeyDate: departureDate,
                            farePaid: selectedBus.price,
                            source: selectedBus.source,
                            destination: selectedBus.destination,
                            transactionId: "TXN" + Date.now()
                        })
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.message || "Failed to create booking in Database.");
                    }
                }

                // Update Local UI States
                setAlreadyBookedSeats(prev => [...prev, ...selectedSeats]);
                setMyBookings(prev => [
                    {
                        id: Date.now(),
                        passengerName: passengerInputName,
                        busName: selectedBus.busName || selectedBus.name,
                        route: `${selectedBus.source} → ${selectedBus.destination}`,
                        seats: selectedSeats,
                        amount: selectedSeats.length * selectedBus.price,
                        date: departureDate
                    },
                    ...prev
                ]);

                setSelectedSeats([]);
                setCurrentStep("dashboard");
                Swal.fire("Booking Confirmed!", `🎉 Ticket booked for ${passengerInputName}! Updated in Operator Portal.`, "success");

            } catch (err) {
                Swal.fire("Booking Failed", err.message || "Failed to finalize booking.", "error");
            }
        });
    };

    const handleCancelTicket = (id, amount) => {
        Swal.fire({
            title: 'Cancel Ticket?',
            text: 'Are you sure you want to cancel this booking?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Confirm Cancellation',
            confirmButtonColor: '#e11d48'
        }).then((result) => {
            if (result.isConfirmed) {
                setMyBookings(prev => prev.filter(b => b.id !== id));
                Swal.fire('Ticket Cancelled', `Refund of ₹${amount} initiated.`, 'success');
            }
        });
    };

    return (
        <div style={{
            fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
            backgroundColor: "#f8fafc",
            minHeight: "100vh",
            color: "#0f172a"
        }}>

            {/* Responsive Inject Style */}
            <style>{`
                @media (max-width: 768px) {
                    .nav-container { flex-direction: column !important; gap: 14px !important; padding: 16px !important; }
                    .nav-links { display: none !important; }
                    .search-grid { grid-template-columns: 1fr !important; }
                    .bus-card { grid-template-columns: 1fr !important; text-align: left !important; gap: 14px !important; }
                    .bus-card > div { text-align: left !important; }
                    .seat-layout-flex { flex-direction: column !important; }
                    .hero-title { font-size: 30px !important; }
                }
            `}</style>

            <datalist id="city-list">
                {CITIES_LIST.map((city, idx) => (
                    <option key={idx} value={city} />
                ))}
            </datalist>

            {/* NAVBAR */}
            <nav className="nav-container" style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                backgroundColor: "rgba(15, 23, 42, 0.96)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                padding: "12px 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: "100%"
            }}>
                <div onClick={() => setCurrentStep('dashboard')} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", color: "#fff", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "20px", boxShadow: "0 4px 12px rgba(225,29,72,0.4)" }}>
                        🚌
                    </div>
                    <span style={{ fontSize: "22px", fontWeight: "900", color: "#ffffff", letterSpacing: "-0.5px" }}>
                        Go<span style={{ color: "#e11d48" }}>Bus</span>
                    </span>
                </div>

                <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "32px", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>
                    <span style={{ color: currentStep === 'dashboard' ? "#ffffff" : "#94a3b8", cursor: "pointer" }} onClick={() => setCurrentStep('dashboard')}>Bus Tickets</span>
                    <span style={{ color: currentStep === 'tracking' ? "#ffffff" : "#94a3b8", cursor: "pointer" }} onClick={() => setCurrentStep('tracking')}>Live Tracking</span>
                    <span style={{ cursor: "pointer" }} onClick={() => Swal.fire('Offers', 'Use GOBUSNEW for 15% instant off', 'info')}>Offers</span>
                    <span style={{ cursor: "pointer" }} onClick={() => Swal.fire('Support', 'Contact: support@gobus.com', 'question')}>Help</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        padding: "5px",
                        borderRadius: "40px",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <button
                            onClick={() => handleSwitchRole('passenger')}
                            style={{
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: "30px",
                                background: userRole === 'passenger' ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'transparent',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            👤 Passenger
                        </button>

                        <button
                            onClick={() => handleSwitchRole('operator')}
                            style={{
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: "30px",
                                background: userRole === 'operator' ? 'linear-gradient(135deg, #059669, #047857)' : 'transparent',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🛠️ Operator
                        </button>
                    </div>

                    {!isLoggedIn ? (
                        <button
                            onClick={() => setView && setView('auth')}
                            style={{
                                background: "linear-gradient(135deg, #e11d48, #be123c)",
                                color: "#ffffff",
                                border: "none",
                                padding: "9px 20px",
                                borderRadius: "10px",
                                fontWeight: "700",
                                fontSize: "13px",
                                cursor: "pointer"
                            }}
                        >
                            Login / Register
                        </button>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: "700" }}>{userName || "Traveler"}</div>
                                <div style={{ color: userRole === 'operator' ? "#34d399" : "#fda4af", fontSize: "10px", fontWeight: "800", textTransform: "uppercase" }}>{userRole} Active</div>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: "rgba(239, 68, 68, 0.15)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    color: "#f87171",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    fontWeight: "700",
                                    fontSize: "12px",
                                    cursor: "pointer"
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* HERO / SEARCH VIEW */}
            {currentStep === 'dashboard' && (
                <>
                    <section style={{
                        position: "relative",
                        minHeight: "460px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px 20px",
                        backgroundImage: "radial-gradient(circle at 50% 20%, rgba(225,29,72,0.15), transparent 70%)"
                    }}>
                        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
                            <img
                                src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1920&q=80"
                                alt="Luxury Bus"
                                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.25) contrast(1.1)" }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.7) 0%, #f8fafc 100%)" }} />
                        </div>

                        <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: "28px", maxWidth: "700px" }}>
                            <span style={{ background: "rgba(225, 29, 72, 0.2)", border: "1px solid rgba(225, 29, 72, 0.5)", color: "#fda4af", padding: "6px 18px", borderRadius: "30px", fontSize: "12px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
                                ⚡ Mode Status: 👤 Passenger Mode
                            </span>
                            <h1 className="hero-title" style={{ color: "#ffffff", fontSize: "42px", fontWeight: "900", marginTop: "14px", marginBottom: "12px", letterSpacing: "-1px", lineHeight: "1.2" }}>
                                Smooth Journeys. Instant Seats.
                            </h1>
                            <p style={{ color: "#cbd5e1", fontSize: "15px", margin: 0, fontWeight: "500" }}>
                                Reserve verified intercity bus seats with live GPS tracking and zero hidden charges.
                            </p>
                        </div>

                        <div style={{
                            position: "relative",
                            zIndex: 10,
                            width: "100%",
                            maxWidth: "1050px",
                            background: "#ffffff",
                            borderRadius: "24px",
                            padding: "24px",
                            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
                            border: "1px solid #e2e8f0"
                        }}>
                            <form onSubmit={handleSearchSubmit} className="search-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr 1fr auto", gap: "12px", alignItems: "center" }}>
                                <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 16px", borderRadius: "14px" }}>
                                    <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: "800", color: "#64748b", letterSpacing: "0.5px", marginBottom: "4px" }}>FROM CITY</label>
                                    <input
                                        type="text"
                                        list="city-list"
                                        placeholder="Type or select city"
                                        value={leavingFrom}
                                        onChange={(e) => setLeavingFrom(e.target.value)}
                                        required
                                        style={{ border: "none", background: "transparent", outline: "none", fontWeight: "700", color: "#0f172a", fontSize: "15px", width: "100%" }}
                                    />
                                </div>

                                <button type="button" onClick={() => { const temp = leavingFrom; setLeavingFrom(goingTo); setGoingTo(temp); }} style={{ width: "42px", height: "42px", borderRadius: "50%", border: "1px solid #cbd5e1", background: "#ffffff", color: "#e11d48", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "auto" }}>⇄</button>

                                <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 16px", borderRadius: "14px" }}>
                                    <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: "800", color: "#64748b", letterSpacing: "0.5px", marginBottom: "4px" }}>TO CITY</label>
                                    <input
                                        type="text"
                                        list="city-list"
                                        placeholder="Type or select city"
                                        value={goingTo}
                                        onChange={(e) => setGoingTo(e.target.value)}
                                        required
                                        style={{ border: "none", background: "transparent", outline: "none", fontWeight: "700", color: "#0f172a", fontSize: "15px", width: "100%" }}
                                    />
                                </div>

                                <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 16px", borderRadius: "14px" }}>
                                    <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", fontWeight: "800", color: "#64748b", letterSpacing: "0.5px", marginBottom: "4px" }}>DATE OF JOURNEY</label>
                                    <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required style={{ border: "none", background: "transparent", outline: "none", fontWeight: "700", color: "#0f172a", fontSize: "14px", width: "100%" }} />
                                </div>

                                <button type="submit" style={{ height: "100%", padding: "16px 28px", background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", color: "#ffffff", border: "none", borderRadius: "14px", fontWeight: "800", fontSize: "15px", cursor: "pointer" }}>
                                    Search Fleets ➔
                                </button>
                            </form>
                        </div>
                    </section>
                </>
            )}

            {/* LIVE GPS TRACKING MODULE */}
            {currentStep === 'tracking' && (
                <div style={{ maxWidth: "1050px", margin: "30px auto", padding: "0 20px" }}>
                    <button
                        onClick={() => setCurrentStep('dashboard')}
                        style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '10px', fontWeight: "700", cursor: 'pointer', marginBottom: "20px" }}
                    >
                        ← Return to Booking Dashboard
                    </button>
                    <LiveTracking />
                </div>
            )}

            {/* OPERATOR REGISTRATION VIEW */}
            {currentStep === 'registerOperator' && (
                <RegisterOperator
                    onBackToDashboard={() => setCurrentStep('dashboard')}
                    onRegisterSuccess={(registeredEmail) => {
                        setCurrentStep('dashboard');
                        handleSwitchRole('operator', registeredEmail);
                    }}
                />
            )}

            {/* SEARCH RESULTS */}
            {currentStep === 'results' && (
                <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Available Buses</h3>
                            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px" }}>Showing routes for <strong>{leavingFrom || "Origin"}</strong> → <strong>{goingTo || "Destination"}</strong></p>
                        </div>
                        <button onClick={() => setCurrentStep('dashboard')} style={{ padding: '10px 18px', background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: "700", cursor: 'pointer' }}>Modify Search</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {buses.map(bus => (
                            <div key={bus._id} className="bus-card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'center', background: '#ffffff', padding: '20px 24px', borderRadius: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                        <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>{bus.busName || bus.name}</h4>
                                        <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "10px", fontWeight: "800", padding: "3px 8px", borderRadius: "6px" }}>AC Sleeper</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#64748b" }}>📍 {bus.source} → {bus.destination}</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{bus.departure || "21:00"}</span>
                                    <div style={{ fontSize: '11px', fontWeight: "700", color: '#94a3b8', margin: '2px 0' }}>— 8h 30m —</div>
                                    <span style={{ fontSize: '13px', fontWeight: "600", color: '#64748b' }}>{bus.arrival || "05:30"}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#e11d48', marginBottom: '8px' }}>₹{bus.price}</div>
                                    <button onClick={() => handleSelectBus(bus)} style={{ background: '#e11d48', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Select Seats</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SEAT SELECTION */}
            {currentStep === 'seats' && selectedBus && (
                <div style={{ maxWidth: '950px', margin: '30px auto', padding: '24px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px', alignItems: "center" }}>
                        <div>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Select Seats</h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{selectedBus.busName || selectedBus.name} • Seat Fare: <strong style={{ color: "#0f172a" }}>₹{selectedBus.price}</strong></p>
                        </div>
                        <button onClick={() => setCurrentStep('results')} style={{ padding: '8px 16px', background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: "700", cursor: 'pointer' }}>← Back</button>
                    </div>

                    <div className="seat-layout-flex" style={{ display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <div style={{ width: '280px', border: '2px solid #e2e8f0', borderRadius: '20px', padding: '20px', background: '#f8fafc', margin: "0 auto" }}>
                            <div style={{ textAlign: "right", marginBottom: "16px", fontSize: "11px", fontWeight: "800", color: "#94a3b8", borderBottom: '2px dashed #cbd5e1', paddingBottom: '8px' }}>
                                🛞 DRIVER CABIN
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                {['A1', 'A2', '', 'A3', 'B1', 'B2', '', 'B3', 'C1', 'C2', '', 'C3', 'D1', 'D2', '', 'D3', 'E1', 'E2', '', 'E3'].map((seat, idx) => {
                                    if (seat === '') return <div key={idx} />;

                                    const isBooked = alreadyBookedSeats.includes(seat);
                                    const isSelected = selectedSeats.includes(seat);

                                    let bg = '#ffffff';
                                    let color = '#334155';
                                    let border = '1px solid #cbd5e1';

                                    if (isBooked) { bg = '#cbd5e1'; color = '#ffffff'; }
                                    if (isSelected) { bg = '#e11d48'; color = '#ffffff'; border = '1px solid #e11d48'; }

                                    return (
                                        <button
                                            key={seat}
                                            onClick={() => toggleSeatSelection(seat)}
                                            disabled={isBooked}
                                            style={{ height: '40px', background: bg, color: color, border: border, borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: isBooked ? 'not-allowed' : 'pointer' }}
                                        >
                                            {seat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                                <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Booking Breakdown</h4>
                                <p style={{ fontSize: '13px', color: "#475569", margin: "0 0 6px 0" }}>Selected Seats: {selectedSeats.length > 0 ? <strong style={{ color: '#e11d48' }}>{selectedSeats.join(', ')}</strong> : <span style={{ color: '#94a3b8' }}>None</span>}</p>
                                <p style={{ fontSize: '13px', color: "#475569", margin: 0 }}>Total Fare: <strong style={{ fontSize: '20px', color: '#0f172a', display: "block", marginTop: "2px" }}>₹{selectedSeats.length * selectedBus.price}</strong></p>
                            </div>

                            <button onClick={handleCheckoutPayment} style={{ width: '100%', padding: '14px', background: '#e11d48', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
                                PROCEED TO BOOK TICKET
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIVE BOOKINGS LIST */}
            {myBookings.length > 0 && (
                <section style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
                    <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>🎟️ Active Bookings & Tickets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {myBookings.map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", background: '#ffffff', borderLeft: '5px solid #10b981', padding: '16px 20px', borderRadius: '14px', border: "1px solid #e2e8f0" }}>
                                <div>
                                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>CONFIRMED</span>
                                    <h4 style={{ margin: '4px 0 2px 0', fontSize: '15px', fontWeight: "800", color: "#0f172a" }}>{b.busName} — {b.route}</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Passenger: <strong>{b.passengerName}</strong> | Seats: <strong>{b.seats.join(', ')}</strong> | Date: {b.date}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <strong style={{ color: '#0f172a', fontSize: "16px" }}>₹{b.amount}</strong>
                                    <button onClick={() => handleCancelTicket(b.id, b.amount)} style={{ background: 'transparent', border: '1px solid #f43f5e', color: '#f43f5e', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}