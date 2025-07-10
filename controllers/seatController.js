const Seat = require('../models/Seat');
const SeatType = require('../models/SeatType');
const Room = require('../models/Room');
const Ticket=require('../models/Ticket');



const { body, validationResult } = require('express-validator');

const getSeats = async (req, res) => {
  try {
    const { roomId } = req.query;
    const query = roomId ? { roomId } : {};
    const seats = await Seat.find(query).populate('seatTypeId roomId');
    res.json(seats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách ghế', error: error.message });
  }
};

const createSeat = [
  body('ghe_id').isInt().withMessage('ID ghế phải là số nguyên'),
  body('seatNumber').notEmpty().withMessage('Tên ghế không được để trống'),
  body('phong_id').notEmpty().withMessage('Phải cung cấp phong_id'),
  body('loai_ghe_id').notEmpty().withMessage('Phải cung cấp loai_ghe_id'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { ghe_id, seatNumber, row, phong_id, loai_ghe_id } = req.body;

      const room = await Room.findOne({ phong_id });
      if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng với phong_id đã nhập' });

      const seatType = await SeatType.findOne({ loai_ghe_id });
      if (!seatType) return res.status(404).json({ message: 'Không tìm thấy loại ghế với loai_ghe_id đã nhập' });

      const seat = new Seat({
        ghe_id,
        seatNumber,
        row,
        roomId: room._id,             
        seatTypeId: seatType._id      
      });

      await seat.save();
      res.status(201).json({ message: 'Thêm ghế thành công', seat });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm ghế', error: error.message });
    }
  }
];

const updateSeat = [
  body('seatNumber').optional().notEmpty().withMessage('Số ghế không được để trống'),
  body('row').optional().notEmpty().withMessage('Hàng ghế không được để trống'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép sửa ghế' });
    }

    try {
      const seat = await Seat.findOneAndUpdate(
        { ghe_id: req.params.ghe_id }, 
        req.body,
        { new: true }
      );
      if (!seat) return res.status(404).json({ message: 'Không tìm thấy ghế' });
      res.json({ message: 'Cập nhật ghế thành công', seat });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật ghế', error: error.message });
    }
  }
];

const deleteSeat = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép xóa ghế' });
  }

  try {
    const seat = await Seat.findOne({ ghe_id: req.params.ghe_id }); 
    if (!seat) return res.status(404).json({ message: 'Không tìm thấy ghế' });

    const hasTickets = await Ticket.findOne({ seatId: seat._id, status: { $ne: 'canceled' } });
    if (hasTickets) return res.status(400).json({ message: 'Không thể xóa ghế vì có vé liên quan' });

    await Seat.deleteOne({ ghe_id: req.params.ghe_id }); 
    res.json({ message: 'Xóa ghế thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa ghế', error: error.message });
  }
};

module.exports = { getSeats, createSeat, updateSeat, deleteSeat };