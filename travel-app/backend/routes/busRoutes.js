const express = require("express");
const router = express.Router();
const { addBus, getAllBuses } = require('../controllers/busController');

// Get all buses route
router.get("/", getAllBuses);
router.get('/all', getAllBuses);

// Add New Bus route
router.post("/", addBus);
router.post('/add', addBus);

module.exports = router;