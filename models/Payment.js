const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tt_id: { type: Number, required: true, unique: true }, // Thêm tt_id
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  method: { type: String, required: true },
  transactionCode: { type: String },
  paymentDate: { type: Date, required: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true }
});

// Validation để đảm bảo một thanh toán mỗi đơn hàng
paymentSchema.pre('save', async function (next) {
  const existingPayment = await this.constructor.findOne({ orderId: this.orderId });
  if (existingPayment) {
    throw new Error('Order already has a payment');
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);