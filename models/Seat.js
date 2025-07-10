const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  ghe_id: { type: Number, required: true, unique: true }, // Thêm ghe_id
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  seatTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SeatType', required: true }
});

// Validation để kiểm tra trùng ghế trong cùng phòng
seatSchema.pre('save', async function (next) {
  const existingSeat = await this.constructor.findOne({
    roomId: this.roomId,
    seatNumber: this.seatNumber,
    row: this.row
  });
  if (existingSeat) {
    throw new Error('Đã tồn tại trong room');
  }
  next();
});

module.exports = mongoose.model('Seat', seatSchema);