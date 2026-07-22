const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Tracking = require("../models/Tracking");
const { verifyToken } = require("../middleware/authMiddleware");

// ======================================================
// BOOK SEAT
// ======================================================

router.post("/book-seat", verifyToken, async (req, res) => {
    try {

        const {
            busId,
            passengerName,
            seatNumber,
            journeyDate,
            farePaid,
            transactionId
        } = req.body;

        // Seat Already Booked
        const existingBooking = await Booking.findOne({
            busId,
            seatNumber,
            journeyDate,
            bookingStatus: "Confirmed"
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "⚠️ Seat already booked."
            });
        }

        // Create Booking
        const booking = await Booking.create({

            userId: req.user.userId,

            busId,

            passengerName,

            seatNumber,

            journeyDate,

            farePaid,

            paymentStatus: "Completed",

            paymentTransactionId: transactionId,

            bookingStatus: "Confirmed"

        });

        console.log("✅ Booking Saved :", booking._id);

        // Create Tracking Automatically

        const tracking = await Tracking.create({

            userId: req.user.userId,

            bookingId: booking._id,

            latitude: 28.6139,

            longitude: 77.2090,

            status: "pending",

            address: "Bus Starting Point",

            speed: 0,

            direction: "N"

        });

        console.log("✅ Tracking Saved :", tracking._id);

        return res.status(201).json({

            success: true,

            message: "🎉 Ticket Booked Successfully",

            booking,

            tracking

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

// ======================================================
// CANCEL BOOKING
// ======================================================

router.post("/cancel-ticket/:bookingId", verifyToken, async (req, res) => {

    try {

        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {

            return res.status(404).json({

                success: false,

                message: "Booking not found"

            });

        }

        if (booking.userId.toString() !== req.user.userId) {

            return res.status(403).json({

                success: false,

                message: "Unauthorized"

            });

        }

        booking.bookingStatus = "Cancelled";

        booking.paymentStatus = "Refunded";

        booking.cancellationRequestedAt = new Date();

        await booking.save();

        return res.json({

            success: true,

            message: "Ticket Cancelled Successfully"

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});



// ======================================================
// GET ALL BOOKINGS (For Operator / Admin Dashboard)
// ======================================================
const Operator = require("../models/Operator"); // Make sure Operator model import ho

router.get("/all", verifyToken, async (req, res) => {
    try {
        const { operatorId } = req.query;

        // 1. Saari bookings fetch karo
        let bookings = await Booking.find()
            .populate("busId", "busName busNumber source destination price operatorId")
            .populate("userId", "name email mobile")
            .sort({ createdAt: -1 });

        // 2. Agar operatorId aayi hai
        if (operatorId) {
            // Operator ka naam find karo DB se
            const currentOperator = await Operator.findById(operatorId);
            const opName = currentOperator ? currentOperator.name.toLowerCase().trim() : "";

            bookings = bookings.filter(b => {
                if (!b.busId) return false;

                const busOpId = b.busId.operatorId ? b.busId.operatorId.toString() : "";
                const busName = b.busId.busName ? b.busId.busName.toLowerCase().trim() : "";

                // A. Direct ID match ho jaye
                const isIdMatch = busOpId === operatorId.toString();

                // B. Ya fir Bus Name match ho jaye Operator Name se (Fallback)
                const isNameMatch = opName && (busName.includes(opName) || opName.includes(busName));

                return isIdMatch || isNameMatch;
            });
        }

        return res.status(200).json({
            success: true,
            data: bookings,
            bookings: bookings
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
module.exports = router;