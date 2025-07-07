const Seat = require('../models/Seat');
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
  body('seatNumber').notEmpty().withMessage('Số ghế là bắt buộc'),
  body('row').notEmpty().withMessage('Hàng ghế là bắt buộc'),
  body('roomId').isMongoId().withMessage('ID phòng không hợp lệ'),
  body('seatTypeId').isMongoId().withMessage('ID loại ghế không hợp lệ'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép thêm ghế' });
    }

    try {
      const { ghe_id, seatNumber, row, roomId, seatTypeId } = req.body;
      const existingSeat = await Seat.findOne({ roomId, seatNumber, row });
      if (existingSeat) return res.status(400).json({ message: 'Ghế đã tồn tại trong phòng này' });

      const seat = new Seat({ ghe_id, seatNumber, row, roomId, seatTypeId });
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
        { ghe_id: req.params.id },
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
    const seat = await Seat.findOne({ ghe_id: req.params.id });
    if (!seat) return res.status(404).json({ message: 'Không tìm thấy ghế' });

    const hasTickets = await Ticket.findOne({ seatId: seat._id, status: { $ne: 'canceled' } });
    if (hasTickets) return res.status(400).json({ message: 'Không thể xóa ghế vì có vé liên quan' });

    await Seat.deleteOne({ ghe_id: req.params.id });
    res.json({ message: 'Xóa ghế thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa ghế', error: error.message });
  }
};

module.exports = { getSeats, createSeat, updateSeat, deleteSeat };