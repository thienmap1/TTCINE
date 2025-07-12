const mongoose = require('mongoose');

const Order = require('../models/Order');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');

const createOrder = [
  body('dh_id').isInt().withMessage('ID đơn hàng phải là số nguyên'),
  body('totalAmount').isInt({ min: 0 }).withMessage('Tổng tiền phải >= 0'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { dh_id, totalAmount } = req.body;
      const userId = req.user.userId;

      const existing = await Order.findOne({ dh_id });
      if (existing) return res.status(400).json({ message: 'Mã đơn hàng đã tồn tại' });

      const qrText = `ORDER-${dh_id}`;
      const qrCode = await QRCode.toDataURL(qrText);

      const order = new Order({ dh_id, userId, totalAmount, qrCode });
      await order.save();

      res.status(201).json({ message: 'Tạo đơn hàng thành công', order });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi tạo đơn hàng', error: error.message });
    }
  }
];

const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy đơn hàng', error: error.message });
  }
};

module.exports = { createOrder, getOrdersByUser };

