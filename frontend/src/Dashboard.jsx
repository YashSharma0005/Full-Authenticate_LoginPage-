import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import App from './App';

export default function Dashboard({ setView }) {
    // App Flow States
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentStep, setCurrentStep] = useState('search'); // 'search' | 'results' | 'seats'

    // Form Inputs
    const [leavingFrom, setLeavingFrom] = useState('');
    const [goingTo, setGoingTo] = useState('');
    const [departureDate, setDepartureDate] = useState('2026-07-14');

    // Booking Data States
    const [selectedBus, setSelectedBus] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [myBookings, setMyBookings] = useState([]);

    // Mock Database Fleets (MongoDB Structure Replica)
    const mockBuses = [
        { id: 'b1', name: 'GOBUS Royal Travels', type: 'AC Sleeper 2+1', departure: '09:00 PM', arrival: '06:00 AM', price: 799, rating: '4.8', windowSeatsLeft: 12 },
        { id: 'b2', name: 'Rakesh Express Premium', type: 'Non-AC Sleeper', departure: '10:15 PM', arrival: '07:45 AM', price: 549, rating: '4.5', windowSeatsLeft: 5 },
        { id: 'b3', name: 'Intercity Smart Bus', type: 'Volvo Multi-Axle AC', departure: '11:00 PM', arrival: '08:00 AM', price: 1250, rating: '4.9', windowSeatsLeft: 18 }
    ];

    // Already Booked Seats Database (Rule 5: Prevention Key)
    const [alreadyBookedSeats, setAlreadyBookedSeats] = useState(['A3', 'B2', 'C1', 'C2']);

    // Dashboard.jsx के अंदर का useEffect ब्लॉक
    useEffect(() => {
        const token = localStorage.getItem('gobus_jwt_token');

        if (!token) {
            // 🚨 अगर टोकन गायब है, तो फ़ौरन रीडायरेक्ट करें और आगे का कोड न चलने दें
            window.location.hash = '#/auth';
            setView('auth');
        } else {
            setIsLoggedIn(true);
        }
    }, [setView]);

    // 🛡️ RULE 1: Auth Guard Interceptor
    const checkAuthAndProceed = (actionCallback) => {
        if (!isLoggedIn) {
            Swal.fire({
                title: 'Authentication Required',
                text: 'Please log in to your GOBUS profile to lock your seats and handle payment gates securely.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Login / Signup Now',
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#4b5563'
            }).then((result) => {
                if (result.isConfirmed) setView('auth');
            });
            return false;
        }
        if (actionCallback) actionCallback();
        return true;
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!leavingFrom || !goingTo) {
            Swal.fire('Error', 'Please enter both Origin and Destination cities.', 'error');
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
            Swal.fire('Seat Unavailable', 'This specific seat is already reserved by another passenger.', 'error');
            return;
        }
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(prev => prev.filter(s => s !== seatId));
        } else {
            setSelectedSeats(prev => [...prev, seatId]);
        }
    };

    // 💳 RULE 6: Proper Payment Simulation & MongoDB Logging Mock
    const handleCheckoutPayment = () => {
        checkAuthAndProceed(() => {
            if (selectedSeats.length === 0) {
                Swal.fire('No Seats Picked', 'Please tap on at least one available seat layout block.', 'info');
                return;
            }

            const totalAmount = selectedBus.price * selectedSeats.length;

            Swal.fire({
                title: '💳 Secure Payment Gateway',
                html: `
                    <div style="text-align: left; padding: 10px;">
                        <p><strong>Operator:</strong> ${selectedBus.name}</p>
                        <p><strong>Seats Locked:</strong> ${selectedSeats.join(', ')}</p>
                        <p style="font-size: 18px; color: #dc2626;"><strong>Total Amount:</strong> ₹${totalAmount}</p>
                        <hr style="border: 1px dashed #ddd; margin: 15px 0;"/>
                        <input type="text" id="swal-card" class="swal2-input" placeholder="Enter 16 Digit Card Number" style="margin: 5px 0; width:90%;">
                        <input type="password" id="swal-pin" class="swal2-input" placeholder="CVV" style="margin: 5px 0; width:30%;">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'PAY NOWSecurely',
                confirmButtonColor: '#dc2626',
                preConfirm: () => {
                    const card = document.getElementById('swal-card').value;
                    const pin = document.getElementById('swal-pin').value;
                    if (!card || !pin) {
                        Swal.showValidationMessage('Please fill your payment criteria details');
                    }
                    return { card, pin };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Processing Transaction...',
                        text: 'Verifying bank nodes and locking seat coordinates...',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });

                    // Server Node / MongoDB latency trigger simulation
                    setTimeout(() => {
                        // Update booked database array locally to prevent duplication instantly
                        setAlreadyBookedSeats(prev => [...prev, ...selectedSeats]);

                        const newTicket = {
                            id: 'TXN-' + Math.floor(Math.random() * 900000 + 100000),
                            busName: selectedBus.name,
                            route: `${leavingFrom} → ${goingTo}`,
                            seats: selectedSeats,
                            amount: totalAmount,
                            date: departureDate
                        };

                        setMyBookings(prev => [newTicket, ...prev]);
                        setSelectedSeats([]);
                        setCurrentStep('search');

                        Swal.fire({
                            icon: 'success',
                            title: '🎉 Ticket Confirmed!',
                            text: `Seats ${newTicket.seats.join(', ')} successfully mapped to MongoDB cluster.`,
                            confirmButtonColor: '#10b981'
                        });
                    }, 2000);
                }
            });
        });
    };

    // 🔄 RULE 6: Instant Ticket Cancellation Engine (1-2 Hours Refund System)
    const handleCancelTicket = (id, amount) => {
        Swal.fire({
            title: 'Cancel this Ticket?',
            text: 'Are you sure you want to trigger immediate cancellation protocols?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Cancel Fleet Seat',
            confirmButtonColor: '#dc2626'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket Terminated',
                    text: `Cancellation approved! Your refund of ₹${amount} has been processed back to your original source channel. It will reflect within 1 to 2 hours maximum.`,
                    confirmButtonColor: '#dc2626'
                });
                setMyBookings(prev => prev.filter(b => b.id !== id));
            }
        });
    };

    return (
        <div className="gobus-dashboard-container">
            {/* STEP 1: SEARCH WIDGET BANNER */}
            {currentStep === 'search' && (
                <section className="hero-scenic-viewport">
                    <div className="scenic-background-image-layer">
                        <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=80" alt="Scenic Bus Route" className="actual-hero-img" />
                        <div className="hero-dark-overlay"></div>
                    </div>

                    <div className="floating-search-engine-card">
                        <div className="search-category-tabs-row">
                            <div className="left-tabs-cluster">
                                <button className="category-tab-btn is-active">🚌 Buses</button>
                                <button className="category-tab-btn" onClick={() => Swal.fire('Coming Soon', 'Flight modules integration scheduled for Next Phase.', 'info')}>✈️ Flights</button>
                                <button className="category-tab-btn" onClick={() => Swal.fire('Coming Soon', 'Train APIs connecting via IRCTC server channels.', 'info')}>🚂 Trains</button>
                            </div>
                            <div className="right-platform-tagline">⚡ India's Fastest Booking Platform</div>
                        </div>

                        <form onSubmit={handleSearchSubmit} className="inline-search-fields-bar">
                            <div className="input-field-wrapper">
                                <span className="field-marker-icon">📍</span>
                                <div className="field-input-stack">
                                    <label>From</label>
                                    <input type="text" placeholder="Leaving From" value={leavingFrom} onChange={(e) => setLeavingFrom(e.target.value)} required />
                                </div>
                            </div>

                            <button type="button" className="field-swap-circle-button" onClick={() => { const t = leavingFrom; setLeavingFrom(goingTo); setGoingTo(t); }}>⇄</button>

                            <div className="input-field-wrapper">
                                <span className="field-marker-icon">🔍</span>
                                <div className="field-input-stack">
                                    <label>To</label>
                                    <input type="text" placeholder="Going To" value={goingTo} onChange={(e) => setGoingTo(e.target.value)} required />
                                </div>
                            </div>

                            <div className="input-field-wrapper">
                                <span className="field-marker-icon">📅</span>
                                <div className="field-input-stack">
                                    <label>Departure Date</label>
                                    <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
                                </div>
                            </div>

                            <button type="submit" className="execute-search-action-button">Search Buses ›</button>
                        </form>
                    </div>
                </section>
            )}

            {/* STEP 2: LIVE BUS RESULTS PANEL */}
            {currentStep === 'results' && (
                <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                        <h3>🚌 Available Fleets: {leavingFrom} to {goingTo}</h3>
                        <button onClick={() => setCurrentStep('search')} style={{ padding: '8px 16px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>← Back to Modify Search</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {mockBuses.map(bus => (
                            <div key={bus.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#111827' }}>{bus.name}</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{bus.type} • <span style={{ color: '#059669', fontWeight: '600' }}>⭐ {bus.rating}</span></p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{bus.departure}</span>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0' }}>———— 9h 00m ————</div>
                                    <span style={{ fontSize: '14px', color: '#4b5563' }}>{bus.arrival}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', marginBottom: '4px' }}>₹{bus.price}</div>
                                    <button onClick={() => handleSelectBus(bus)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Select Seats</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 3: ABHIBUS INSPIRED INTERACTIVE SEAT LAYOUT MAP */}
            {currentStep === 'seats' && selectedBus && (
                <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '24px' }}>
                        <div>
                            <h3>{selectedBus.name} — Seat Allocation Setup</h3>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Base Ticket Price Tier: <strong>₹{selectedBus.price}</strong> per seat structural block.</p>
                        </div>
                        <button onClick={() => setCurrentStep('results')} style={{ padding: '8px 16px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', height: 'fit-content' }}>← Back to Fleets</button>
                    </div>

                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* THE GEOMETRIC BUS CABIN */}
                        <div style={{ width: '300px', border: '3px solid #9ca3af', borderRadius: '16px 16px 8px 8px', padding: '20px', position: 'relative', background: '#f9fafb' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', fontSize: '20px', borderBottom: '2px dashed #d1d5db', paddingBottom: '10px' }}>🕹️ (Driver Deck)</div>

                            {/* SEAT ITERATOR ENGINE MATRICES */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {['A1', 'A2', '', 'A3', 'B1', 'B2', '', 'B3', 'C1', 'C2', '', 'C3', 'D1', 'D2', '', 'D3', 'E1', 'E2', '', 'E3'].map((seat, idx) => {
                                    if (seat === '') return <div key={idx} />; // Aisle Walkway space

                                    const isBooked = alreadyBookedSeats.includes(seat);
                                    const isSelected = selectedSeats.includes(seat);

                                    let bg = '#e5e7eb'; // Available
                                    let color = '#374151';
                                    if (isBooked) { bg = '#9ca3af'; color = '#ffffff'; } // Reserved
                                    if (isSelected) { bg = '#dc2626'; color = '#ffffff'; } // Selected

                                    return (
                                        <button
                                            key={seat}
                                            onClick={() => toggleSeatSelection(seat)}
                                            disabled={isBooked}
                                            style={{ height: '45px', background: bg, color: color, border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: isBooked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                                        >
                                            {seat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CHECKOUT SUMMARY SIDE PANEL */}
                        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '16px' }}>
                                <h4>Booking Summary Matrix</h4>
                                <p style={{ fontSize: '14px' }}>Selected Seats: {selectedSeats.length > 0 ? <strong style={{ color: '#dc2626' }}>{selectedSeats.join(', ')}</strong> : <span style={{ color: '#9ca3af' }}>None selected</span>}</p>
                                <p style={{ fontSize: '14px' }}>Total Calculated Fare: <strong style={{ fontSize: '20px', color: '#111827' }}>₹{selectedSeats.length * selectedBus.price}</strong></p>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', fontSize: '12px' }}>
                                    <div><span style={{ display: 'inline-block', width: '15px', height: '15px', background: '#e5e7eb', borderRadius: '3px', verticalAlign: 'middle' }} /> Available</div>
                                    <div><span style={{ display: 'inline-block', width: '15px', height: '15px', background: '#9ca3af', borderRadius: '3px', verticalAlign: 'middle' }} /> Booked</div>
                                    <div><span style={{ display: 'inline-block', width: '15px', height: '15px', background: '#dc2626', borderRadius: '3px', verticalAlign: 'middle' }} /> Selected</div>
                                </div>
                            </div>

                            <button onClick={handleCheckoutPayment} style={{ width: '100%', padding: '16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', marginTop: '20px', boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)' }}>
                                PROCEED TO CARD CHECKOUT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MY BOOKINGS TRACKER LISTING (Rule 6 Showcase Component) */}
            {myBookings.length > 0 && (
                <section style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>🎟️ Your Active GOBUS Travel Tickets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                        {myBookings.map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', borderLeft: '6px solid #10b981', padding: '20px', borderRadius: '0 12px 12px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                                <div>
                                    <span style={{ background: '#dcfce7', color: '#059669', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>CONFIRMED ENGINE MAPPED</span>
                                    <h4 style={{ margin: '6px 0', fontSize: '16px' }}>{b.busName} — <span style={{ color: '#4b5563' }}>{b.route}</span></h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Seats Layout ID: <strong>{b.seats.join(', ')}</strong> | Date: {b.date} | ID: {b.id}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <strong style={{ color: '#111827' }}>₹{b.amount}</strong>
                                    <button onClick={() => handleCancelTicket(b.id, b.amount)} style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                                        Instant Cancel & Refund
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* STATIC MARKETING DISCOUNTS ROW */}
            {/* {currentStep === 'search' && (
                <section className="dashboard-offers-grid-container">
                    <div className="section-header-flex-row">
                        <h2 className="section-main-heading">Exclusive Deals for You</h2>
                    </div>
                    <div className="offers-carousel-track">
                        <div className="promo-card-tile card-bg-pink">
                            <div className="promo-content-side">
                                <span className="offer-tag">FIRST RIDE</span>
                                <h3>Save Flat 15% OFF</h3>
                                <p>On your initial route reservation</p>
                                <div className="promo-coupon-code-badge">GOBUSFIRST</div>
                            </div>
                        </div>
                        <div className="promo-card-tile card-bg-blue">
                            <div className="promo-content-side">
                                <span className="offer-tag">BANK DISCOUNT</span>
                                <h3>Up to ₹300 Cashback</h3>
                                <p>Using RBL Credit & Debit Cards</p>
                                <div className="promo-coupon-code-badge variant-blue">RBL300</div>
                            </div>
                        </div>
                    </div>
                </section>
            )} */}
        </div>
    );
}