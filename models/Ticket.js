const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ve_id: { type: Number, required: true, unique: true }, 
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'canceled'], default: 'pending', required: true }
});

ticketSchema.pre('save', async function (next) {
  const existingTicket = await this.constructor.findOne({
    showtimeId: this.showtimeId,
    seatId: this.seatId,
    status: { $ne: 'canceled' }
  });
  if (existingTicket) {
    throw new Error('Chỗ ngồi đã được đặt cho showtime này');
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);