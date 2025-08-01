const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ve_id: { type: Number, required: true, unique: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seatIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true }], // ← CHỈNH CHỖ NÀY
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' } // ← nếu bạn đang dùng status
});

module.exports = mongoose.model('Ticket', ticketSchema);
