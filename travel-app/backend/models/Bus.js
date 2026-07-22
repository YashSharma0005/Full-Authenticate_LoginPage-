const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    busName: { type: String, required: true },
    busNumber: { type: String, required: true },
    busType: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    driverName: { type: String },
    driverMobile: { type: String },
    operatorId: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Bus", busSchema);