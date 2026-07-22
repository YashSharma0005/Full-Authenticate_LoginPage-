const Tracking = require("../models/Tracking");

// =======================================
// GET LIVE TRACKING
// =======================================

exports.getLiveTrackingData = async (req, res) => {

    try {

        const tracking = await Tracking.find()

            .populate("userId", "name email")

            .populate("bookingId")

            .sort({ createdAt: -1 });

        return res.status(200).json({

            success: true,

            count: tracking.length,

            data: tracking

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// =======================================
// CREATE TRACKING
// =======================================

exports.createTracking = async (req, res) => {

    try {

        const tracking = await Tracking.create(req.body);

        return res.status(201).json({

            success: true,

            data: tracking

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// =======================================
// GET TRACKING BY BOOKING
// =======================================

exports.getTrackingByBookingId = async (req, res) => {

    try {

        const tracking = await Tracking.findOne({

            bookingId: req.params.bookingId

        })

        .populate("userId", "name email")

        .populate("bookingId");

        if (!tracking) {

            return res.status(404).json({

                success: false,

                message: "Tracking Not Found"

            });

        }

        return res.json({

            success: true,

            data: tracking

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// =======================================
// UPDATE LOCATION
// =======================================

exports.updateTrackingLocation = async (req, res) => {

    try {

        const tracking = await Tracking.findOneAndUpdate(

            {

                bookingId: req.params.bookingId

            },

            req.body,

            {

                new: true

            }

        );

        if (!tracking) {

            return res.status(404).json({

                success: false,

                message: "Tracking Not Found"

            });

        }

        return res.json({

            success: true,

            data: tracking

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};