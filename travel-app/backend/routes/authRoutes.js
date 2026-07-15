const express = require("express");
const router = express.Router();

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

module.exports = router;