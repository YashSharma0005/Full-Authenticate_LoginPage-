const express = require("express");
const router = express.Router();
const trackingRoutes = require('./trackingRoutes');
const {
  forgotPassword,
  verifyOtp,
  resetPassword
} = require("../controllers/authController");

console.log("forgotPassword:", forgotPassword);
console.log("verifyOtp:", verifyOtp);
console.log("resetPassword:", resetPassword);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.use('/api/tracking', trackingRoutes);
module.exports = router;