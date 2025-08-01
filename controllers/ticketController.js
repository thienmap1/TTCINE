const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const QRCode = require('qrcode');
const OrderHistory = require('../models/OrderHistory');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const bookTickets = async (req, res) => {
  try {
    const { ve_id, showtimeId, seatIds, price } = req.body; // seatIds là mảng
    const userId = req.user.userId;

    console.log('Received showtimeId:', showtimeId);
    console.log('Received seatIds:', seatIds);

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'Bạn phải chọn ít nhất một ghế' });
    }

    // Lấy suất chiếu và thông tin phim
    const showtime = await Showtime.findById(showtimeId).populate('movieId', 'title');
    if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });

    // Chuyển seatIds về ObjectId
    const seatObjectIds = seatIds.map(id => new mongoose.Types.ObjectId(id));

    // Kiểm tra ghế tồn tại
    const seats = await Seat.find({ _id: { $in: seatObjectIds } });
    if (seats.length !== seatIds.length) {
      return res.status(404).json({ message: 'Một số ghế không tồn tại' });
    }

    // Kiểm tra ghế đã được đặt chưa trong suất chiếu này
    const existingTicket = await Ticket.findOne({
      showtimeId,
      seatIds: { $in: seatObjectIds },
      status: { $ne: 'canceled' }
    });
    if (existingTicket) {
      return res.status(400).json({ message: 'Một số ghế đã được đặt trong suất chiếu này' });
    }

    // Tạo order
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

    // Tạo lịch sử đơn hàng
    const history = new OrderHistory({
      lsdh_id: parseInt(uuidv4().replace(/-/g, '').slice(0, 10), 16),
      orderId: order._id,
      status: 'pending',
      timestamp: new Date()
    });
    await history.save();

    // Tạo ticket với nhiều ghế
    const ticket = new Ticket({
      ve_id,
      orderId: order._id,
      showtimeId,
      seatIds: seatObjectIds,
      price,
      status: 'pending'
    });
    await ticket.save();

    // Trả về thông tin vé
    res.status(201).json({
      message: 'Đặt vé thành công',
      ticket: {
        ve_id: ticket.ve_id,
        price: ticket.price,
        status: ticket.status,
        seats: seats.map(s => ({ row: s.row, seatNumber: s.seatNumber })),
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
    const tickets = await Ticket.find({
      orderId: {
        $in: await Order.find({ userId: req.user.userId }).select('_id')
      }
    }).populate('showtimeId seatIds orderId'); // ✅ đã sửa ở đây

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
