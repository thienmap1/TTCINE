const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const Seat = require('../models/Seat');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const bookTicket = [
  body('showtimeId').isMongoId().withMessage('ID suất chiếu không hợp lệ'),
  body('seatId').isMongoId().withMessage('ID ghế không hợp lệ'),
  body('price').isFloat({ min: 0 }).withMessage('Giá vé phải lớn hơn hoặc bằng 0'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { showtimeId, seatId, price } = req.body;
      const seat = await Seat.findById(seatId);
      if (!seat) return res.status(404).json({ message: 'Không tìm thấy ghế' });

      const existingTicket = await Ticket.findOne({ showtimeId, seatId, status: { $ne: 'canceled' } });
      if (existingTicket) return res.status(400).json({ message: 'Ghế đã được đặt' });

      const order = new Order({
        dh_id: parseInt(uuidv4().replace(/-/g, '').slice(0, 10), 16), // Tạo ID số
        userId: req.user.userId,
        orderDate: new Date(),
        totalAmount: price,
        qrCode: `QR-${Date.now()}`,
      });
      await order.save();

      const ticket = new Ticket({
        ve_id: parseInt(uuidv4().replace(/-/g, '').slice(0, 10), 16),
        orderId: order._id,
        showtimeId,
        seatId,
        price,
        status: 'pending',
      });
      await ticket.save();

      res.status(201).json({ message: 'Đặt vé thành công', ticket, order });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi đặt vé', error: error.message });
    }
  }
];

const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ orderId: { $in: await Order.find({ userId: req.user.userId }).select('_id') } })
      .populate('showtimeId seatId orderId');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách vé', error: error.message });
  }
};

module.exports = { bookTicket, getUserTickets };