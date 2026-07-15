const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    passengerName: { type: String, required: true },
    seatNumber: { type: String, required: true },
    journeyDate: { type: String, required: true }, // Format: YYYY-MM-DD
    farePaid: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Refunded'], default: 'Pending' },
    paymentTransactionId: { type: String },
    bookingStatus: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
    cancellationRequestedAt: { type: Date }
}, { timestamps: true });

// 🛡️ RACE CONDITION PREVENTION: एक बस में, एक तारीख को, एक सीट सिर्फ एक बार ही सेव हो सकती है
bookingSchema.index({ busId: 1, seatNumber: 1, journeyDate: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);