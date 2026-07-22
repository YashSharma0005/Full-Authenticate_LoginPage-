const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'in_transit', 'delivered'],
        default: 'pending'
    },

    address: {
        type: String,
        default: ''
    },

    speed: {
        type: Number,
        default: 0
    },

    direction: {
        type: String,
        default: 'N'
    },

    timestamp: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });


module.exports = mongoose.model('Tracking', trackingSchema);