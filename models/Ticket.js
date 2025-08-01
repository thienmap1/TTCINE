const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ve_id: { type: Number, required: true, unique: true }, 
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  price: { type: Number, required: true },
});


module.exports = mongoose.model('Ticket', ticketSchema);