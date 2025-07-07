const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  phong_id: { type: Number, required: true, unique: true }, // Thêm phong_id
  name: { type: String, required: true },
  type: { type: String, required: true },
  capacity: { type: Number, required: true },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true }
});

module.exports = mongoose.model('Room', roomSchema);

