const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const QRCode = require('qrcode');
const OrderHistory = require('../models/OrderHistory');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const bookTickets = async (req, res) => {
  try {
    const { showtimeId, seatIds } = req.body;
    const userId = req.user.userId;

    const showtime = await Showtime.findById(showtimeId).populate('movieId', 'title');
    if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });

    const existing = await Ticket.find({
      showtimeId,
      seatId: { $in: seatIds },
      status: { $ne: 'canceled' }
    });
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Một số ghế đã được đặt', seats: existing.map(s => s.seatId) });
    }

    const dh_id = Date.now();
    const qrCode = await QRCode.toDataURL(`ORDER-${dh_id}`);

    const order = await Order.create({
      dh_id,
      userId,
      totalAmount: 0, // tạm, cập nhật sau
      qrCode,
      status: 'pending'
    });

    let totalAmount = 0;
    const tickets = [];

    for (const seatId of seatIds) {
      const seat = await Seat.findById(seatId);
      if (!seat) continue;

      const ticket = await Ticket.create({
        ve_id: parseInt(uuidv4().replace(/-/g, '').slice(0, 10), 16),
        orderId: order._id,
        showtimeId,
        seatId,
        price: seat.price,
        status: 'pending'
      });

      totalAmount += seat.price;
      tickets.push(ticket);
    }

    order.totalAmount = totalAmount;
    await order.save();

    await OrderHistory.create({
      lsdh_id: Date.now(),
      orderId: order._id,
      status: 'pending',
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'Đặt vé thành công',
      order: {
        dh_id: order.dh_id,
        totalAmount: order.totalAmount,
        qrCode: order.qrCode
      },
      tickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt vé', error: error.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ orderId: { $in: await Order.find({ userId: req.user.userId }).select('_id') } })
      .populate('showtimeId seatId orderId');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách vé', error: error.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { ve_id } = req.params;

    const ticket = await Ticket.findOne({ ve_id }).populate('orderId');

    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé' });

    const isOwner = ticket.orderId.userId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xoá vé này' });
    }

    await Ticket.deleteOne({ ve_id });
    res.json({ message: 'Xoá vé thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xoá vé', error: error.message });
  }
};

module.exports = { bookTickets, getUserTickets, deleteTicket };


