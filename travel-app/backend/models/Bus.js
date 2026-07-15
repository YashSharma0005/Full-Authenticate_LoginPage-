const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: { type: String, required: true, unique: true },
    operatorName: { type: String, required: true },
    busType: { type: String, enum: ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Non-AC Seater'], required: true },
    source: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    totalSeats: { type: Number, default: 40 },
    basePrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);