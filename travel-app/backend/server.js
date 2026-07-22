require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const busRoutes = require("./routes/busRoutes");
const trackingRoutes = require('./routes/trackingRoutes');

// Model Imports
const User = require('./models/User');
const Operator = require('./models/Operator');
const Bus = require('./models/Bus');

const app = express();

app.use(express.json());
app.use(cors());

// Route Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/buses", busRoutes);

const JWT_SECRET = 'gobus_secure_signature_token_key_2026';
const MONGO_URI = 'mongodb://localhost:27017/gobus_db';

/* ==========================================
   🤖 AUTOMATIC BUS-OPERATOR LINKING SCRIPT
   ========================================== */
/* ==========================================
   🤖 FOOLPROOF BUS-OPERATOR LINKING
   ========================================== */
/* ==========================================
   🤖 FOOLPROOF BUS-OPERATOR LINKING
   ========================================== */
const autoLinkBusesToOperators = async () => {
    try {
        const buses = await Bus.find();
        const operators = await Operator.find();

        if (buses.length === 0 || operators.length === 0) {
            console.log("⚠️ DB me Buses ya Operators nahi hain.");
            return;
        }

        console.log("🔄 Linking buses to operators...");

        for (let bus of buses) {
            // 1. Exact ya partial name match search karo operator me
            let matchedOp = operators.find(op => 
                op.name && bus.busName && 
                (op.name.toLowerCase().includes(bus.busName.toLowerCase()) || 
                 bus.busName.toLowerCase().includes(op.name.toLowerCase()))
            );

            // 2. Agar match milta hai tabhi link karein. (Yahan humne fallback hata diya hai!)
            if (matchedOp) {
                bus.operatorId = matchedOp._id;
                await bus.save();
                console.log(`✅ LINKED: Bus "${bus.busName}" -> Operator "${matchedOp.name}" (${matchedOp._id})`);
            } else {
                // Agar match nahi mila ("Local Bus" ke case mein), toh operatorId null kar do
                bus.operatorId = null;
                await bus.save();
                console.log(`⚠️ UNLINKED/SKIPPED: Bus "${bus.busName}" (No matching operator found)`);
            }
        }

        console.log("🎉 All buses are safely checked and linked now!");
    } catch (error) {
        console.error("❌ Link Error:", error.message);
    }
};

// Database Connection
mongoose.connect(MONGO_URI)
  .then(async () => {
      console.log('✅ Connected securely to MongoDB Instance');
      // Execute auto-repair once connected
      await autoLinkBusesToOperators();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


/* ==========================================
   OPERATOR ROUTES
   ========================================== */

// 1. OPERATOR REGISTER ENDPOINT
app.post('/api/operators/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingOperator = await Operator.findOne({ email });
    if (existingOperator) {
      return res.status(400).json({ message: "Is Email se pehle se Operator account bana hua hai!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOperator = new Operator({
      name,
      email,
      password: hashedPassword
    });

    await newOperator.save();

    res.status(201).json({
      success: true,
      message: "Operator registered successfully!"
    });
  } catch (error) {
    res.status(500).json({ message: "Database Error: " + error.message });
  }
});


// 2. OPERATOR LOGIN ENDPOINT
app.post('/api/operators/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const operator = await Operator.findOne({ email });
    if (!operator) {
      return res.status(401).json({ message: "Invalid Operator Email or Password!" });
    }

    const isMatch = await bcrypt.compare(password, operator.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Operator Email or Password!" });
    }

    const token = jwt.sign(
      { id: operator._id, role: 'operator', email: operator.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token: token,
      operatorId: operator._id, // 👈 Included operatorId for Frontend LocalStorage
      operatorName: operator.name
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication Error: " + error.message });
  }
});


/* ==========================================
   USER AUTHENTICATION ROUTES
   ========================================== */

// 1. SIGN UP ROUTE
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

// 2. LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: 'Account not found. Please sign up.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect security password.' });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server authentication failure.' });
  }
});

app.listen(5000, () => console.log('🚀 GOBUS Server running on port 5000'));