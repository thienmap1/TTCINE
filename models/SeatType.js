const mongoose = require('mongoose');

const seatTypeSchema = new mongoose.Schema({
  loai_ghe_id: { type: Number, required: true, unique: true }, // Thêm loai_ghe_id
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('SeatType', seatTypeSchema);