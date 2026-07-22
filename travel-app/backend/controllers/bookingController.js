const Booking = require("../models/Booking");
const Bus = require("../models/Bus");

exports.createBooking = async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json({ success: true, message: "Booking created successfully", data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const { operatorId } = req.query;

        if (!operatorId || operatorId === "undefined" || operatorId === "null") {
            return res.json({ success: true, data: [] });
        }

        const operatorBuses = await Bus.find({ 
            $or: [{ operatorId: operatorId }, { operator: operatorId }] 
        }).lean();

        const busIds = operatorBuses.map(bus => bus._id);
        const busNumbers = operatorBuses.map(bus => bus.busNumber).filter(Boolean);
        const busNames = operatorBuses.map(bus => bus.busName).filter(Boolean);

        const bookings = await Booking.find({
            $or: [
                { busId: { $in: busIds } },
                { bus: { $in: busIds } },
                { "busId.busNumber": { $in: busNumbers } },
                { "bus.busNumber": { $in: busNumbers } },
                { "busId.busName": { $in: busNames } },
                { "bus.busName": { $in: busNames } }
            ]
        })
        .populate("userId")
        .populate("busId")
        .lean();

        const filteredBookings = bookings.filter(item => {
            const assignedBus = item.busId || item.bus;
            if (!assignedBus) return false;
            
            const bId = assignedBus._id ? assignedBus._id.toString() : assignedBus.toString();
            const matchById = busIds.some(id => id.toString() === bId);
            const matchByOpField = assignedBus.operatorId && assignedBus.operatorId.toString() === operatorId.toString();

            return matchById || matchByOpField;
        });

        res.json({ success: true, data: filteredBookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};