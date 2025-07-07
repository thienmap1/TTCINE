const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  lsdh_id: { type: Number, required: true, unique: true }, // Thêm lsdh_id
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('OrderHistory', historySchema);