const express = require("express");
const router = express.Router();

const trackingController = require("../controllers/trackingController");

router.get("/live", trackingController.getLiveTrackingData);

router.get("/:bookingId", trackingController.getTrackingByBookingId);

router.post("/create", trackingController.createTracking);

router.put("/:bookingId", trackingController.updateTrackingLocation);

module.exports = router;    