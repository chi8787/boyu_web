const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true } // 格式: YYYY-MM-DD
});

module.exports = mongoose.model('Booking', bookingSchema);