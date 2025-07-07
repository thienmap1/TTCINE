const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { body, validationResult } = require('express-validator');

const createPayment = [
  body('orderId').isMongoId().withMessage('ID đơn hàng không hợp lệ'),
  body('method').notEmpty().withMessage('Phương thức thanh toán là bắt buộc'),
  body('amount').isFloat({ min: 0 }).withMessage('Số tiền phải lớn hơn hoặc bằng 0'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { orderId, method, amount } = req.body;
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      const payment = new Payment({
        tt_id: parseInt(require('uuid').v4().replace(/-/g, '').slice(0, 10), 16),
        orderId,
        method,
        transactionCode: `TX-${Date.now()}`,
        paymentDate: new Date(),
        status: 'pending',
        amount,
      });
      await payment.save();

      // Cập nhật trạng thái vé thành 'paid'
      await Ticket.updateMany({ orderId }, { status: 'paid' });

      res.status(201).json({ message: 'Tạo thanh toán thành công', payment });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo thanh toán', error: error.message });
    }
  }
];

const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ orderId: { $in: await Order.find({ userId: req.user.userId }).select('_id') } })
      .populate('orderId');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thanh toán', error: error.message });
  }
};

module.exports = { createPayment, getUserPayments };