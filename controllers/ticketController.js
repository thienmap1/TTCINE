const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const bookTicket = async (req, res) => {
  try {
    const { ve_id, showtimeId, seatId, price } = req.body;
    const userId = req.user.userId;

    const showtime = await Showtime.findById(showtimeId).populate('movieId', 'title');
    const seat = await Seat.findById(seatId);
    if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    if (!seat) return res.status(404).json({ message: 'Không tìm thấy ghế' });

    const existingTicket = await Ticket.findOne({
      showtimeId,
      seatId,
      status: { $ne: 'canceled' }
    });

    if (existingTicket) {
      return res.status(400).json({ message: ' Ghế này đã được đặt trong suất chiếu này' });
    }

    const dh_id = Date.now();
    const qrText = `ORDER-${dh_id}`;
    const qrCode = await QRCode.toDataURL(qrText);

    const order = new Order({
      dh_id,
      userId,
      totalAmount: price,
      qrCode
    });
    await order.save();

    const ticket = new Ticket({
      ve_id,
      orderId: order._id,
      showtimeId,
      seatId,
      price,
      status: 'pending'
    });
    await ticket.save();

    res.status(201).json({
      message: 'Đặt vé thành công',
      ticket: {
        ve_id: ticket.ve_id,
        price: ticket.price,
        status: ticket.status,
        seat: seat.seatNumber,
        row: seat.row,
        movie: showtime.movieId.title,
        showtime: {
          date: showtime.date,
          startTime: showtime.startTime,
          endTime: showtime.endTime
        }
      },
      order: {
        dh_id: order.dh_id,
        totalAmount: order.totalAmount,
        qrCode
      }
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

module.exports = { bookTicket, getUserTickets, deleteTicket };
