const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ve_id: { type: Number, required: true, unique: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seatIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true }],
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' }
}, { timestamps: true }); // 👈 THÊM DÒNG NÀY ĐỂ CÓ createdAt, updatedAt

module.exports = mongoose.model('Ticket', ticketSchema);
