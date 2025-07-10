const mongoose = require('mongoose');

const seatTypeSchema = new mongoose.Schema({
  loai_ghe_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('SeatType', seatTypeSchema);