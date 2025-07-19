const mongoose = require('mongoose');

const Order = require('../models/Order');
const QRCode = require('qrcode');
const OrderHistory = require('../models/OrderHistory');
const Ticket = require('../models/Ticket');
const { v4: uuidv4 } = require('uuid');

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
const payOrder = async (req, res) => {
  try {
    const { orderId } = req.params;


    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });


    const isOwner = order.userId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Bạn không có quyền thanh toán đơn hàng này' });


    order.status = 'paid';
    await order.save();


    const history = new OrderHistory({
      lsdh_id: parseInt(uuidv4().replace(/-/g, '').slice(0, 10), 16),
      orderId: order._id,
      status: 'paid',
      timestamp: new Date()
    });
    await history.save();

    res.json({ message: 'Thanh toán thành công', order });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thanh toán', error: error.message });
  }
};

const getTicketsByOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const tickets = await Ticket.find({ orderId }).populate('seatId showtimeId');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy vé theo đơn hàng', error: error.message });
  }
};

module.exports = { createOrder, getOrdersByUser,payOrder,getTicketsByOrder };

