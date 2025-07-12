const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  dh_id: { type: Number, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderDate: { type: Date, default: Date.now, required: true },
  totalAmount: { type: Number, required: true },
  qrCode: { type: String, required: true }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
