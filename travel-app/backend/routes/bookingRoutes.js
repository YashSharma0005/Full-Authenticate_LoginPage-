const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/authMiddleware'); // आपका JWT मिडलवेयर

// 1. सुरक्षित सीट बुकिंग (Atomic Verification & Save)
router.post('/book-seat', verifyToken, async (req, res) => {
    const { busId, passengerName, seatNumber, journeyDate, farePaid, transactionId } = req.body;

    try {
        // चेक करें कि क्या सीट पहले से बुक तो नहीं है
        const existingBooking = await Booking.findOne({ busId, seatNumber, journeyDate, bookingStatus: 'Confirmed' });
        if (existingBooking) {
            return res.status(400).json({ success: false, message: "⚠️ This seat has just been taken by another user. Please select another seat." });
        }

        // नया बुकिंग डॉक्यूमेंट बनाएं
        const newBooking = new Booking({
            userId: req.user.id, // JWT से मिली यूजर ID
            busId,
            passengerName,
            seatNumber,
            journeyDate,
            farePaid,
            paymentStatus: 'Completed',
            paymentTransactionId: transactionId,
            bookingStatus: 'Confirmed'
        });

        await newBooking.save();
        return res.status(201).json({ success: true, message: "🎉 Ticket Booked Successfully!", booking: newBooking });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "⚡ Race Condition! This seat was locked by someone else a millisecond ago." });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 2. इंस्टेंट कैंसिलेशन और 1-2 घंटे में रिफंड प्रोसेस (Rule 6)
router.post('/cancel-ticket/:bookingId', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: "Booking record missing." });

        // सुरक्षा जांच: क्या यह टिकट इसी यूजर का है?
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized action." });
        }

        // कैंसिलेशन और रिफंड रिस्पांस ट्रिगर
        booking.bookingStatus = 'Cancelled';
        booking.paymentStatus = 'Refunded';
        booking.cancellationRequestedAt = new Date();
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Ticket cancelled successfully. Your refund of ₹" + booking.farePaid + " has been initiated and will hit your account within 1-2 hours."
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;