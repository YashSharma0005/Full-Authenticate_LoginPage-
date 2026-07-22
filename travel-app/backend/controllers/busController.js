const Bus = require("../models/Bus");

// Get All Buses
exports.getAllBuses = async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json({
            success: true,
            data: buses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add Bus
exports.addBus = async (req, res) => {
    try {
        const bus = new Bus({
            busName: req.body.busName,
            busNumber: req.body.busNumber,
            busType: req.body.busType,
            source: req.body.source,
            destination: req.body.destination,
            departureTime: req.body.departureTime,
            arrivalTime: req.body.arrivalTime,
            price: req.body.price,
            totalSeats: req.body.totalSeats,
            driverName: req.body.driverName,
            driverMobile: req.body.driverMobile,
            operatorId: req.body.operatorId || null
        });

        await bus.save();

        res.status(201).json({
            success: true,
            message: "Bus Added Successfully",
            data: bus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};