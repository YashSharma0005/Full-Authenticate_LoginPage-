const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    default: ""
  },
  otpExpiry: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("User", userSchema);