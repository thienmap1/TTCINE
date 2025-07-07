const OrderHistory = require('../models/OrderHistory');
const { body, validationResult } = require('express-validator');

const addOrderHistory = [
  body('orderId').isMongoId().withMessage('ID đơn hàng không hợp lệ'),
  body('status').notEmpty().withMessage('Trạng thái là bắt buộc'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { orderId, status } = req.body;
      const history = new OrderHistory({
        lsdh_id: parseInt(require('uuid').v4().replace(/-/g, '').slice(0, 10), 16),
        orderId,
        status,
        timestamp: new Date(),
      });
      await history.save();
      res.status(201).json({ message: 'Thêm lịch sử đơn hàng thành công', history });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm lịch sử đơn hàng', error: error.message });
    }
  }
];

const getOrderHistory = async (req, res) => {
  try {
    const histories = await OrderHistory.find({ orderId: req.params.orderId }).sort({ timestamp: 1 });
    res.json(histories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử đơn hàng', error: error.message });
  }
};

module.exports = { addOrderHistory, getOrderHistory };