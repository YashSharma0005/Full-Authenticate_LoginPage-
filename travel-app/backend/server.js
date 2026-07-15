require("dotenv").config();
console.log("EMAIL:", process.env.EMAIL);
console.log("PASS:", process.env.EMAIL_PASS);
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();

const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

const JWT_SECRET = 'gobus_secure_signature_token_key_2026';
const MONGO_URI = 'mongodb://localhost:27017/gobus_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected securely to MongoDB Instance'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define User Schema
// const User = require('./models/User');

// const User = mongoose.model('User', userSchema);

// Verify OTP API

// exports.verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   const user = await User.findOne({ email });

//   if (!user) {
//     return res.status(404).json({
//       message: "User not found"
//     });
//   }

//   if (
//     user.otp !== otp ||
//     user.otpExpiry < Date.now()
//   ) {
//     return res.status(400).json({
//       message: "Invalid OTP"
//     });
//   }

//   res.json({
//     message: "OTP Verified"
//   });
// };


// // Reset Password API


// // const bcrypt = require("bcryptjs");

// exports.resetPassword = async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });

//   const hashedPassword =
//     await bcrypt.hash(password, 10);

//   user.password = hashedPassword;
//   user.otp = "";
//   user.otpExpiry = null;

//   await user.save();

//   res.json({
//     message: "Password Updated"
//   });
// };




/* ==========================================
   1. SIGN UP ROUTE (Saves to Mongo -> Redirects)
   ========================================== */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to MongoDB
    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful! Please login.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server registry failure.' });
  }
});

/* ==========================================
   2. LOGIN ROUTE (Verifies -> Generates JWT)
   ========================================== */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Find user in MongoDB
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: 'Account not found. Please sign up.' });
    }

    // Verify Password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect security password.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send token and payload back to frontend
    res.status(200).json({
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server authentication failure.' });
  }
});

app.listen(5000, () => console.log('🚀 GOBUS Auth Server running on port 5000'));