const SeatType = require('../models/SeatType');
const { body, validationResult } = require('express-validator');

const getSeatTypes = async (req, res) => {
  try {
    const seatTypes = await SeatType.find();
    res.json(seatTypes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách loại ghế', error: error.message });
  }
};

const createSeatType = [
  body('loai_ghe_id').isInt().withMessage('ID loại ghế phải là số nguyên'),
  body('name').notEmpty().withMessage('Tên loại ghế là bắt buộc'),
  body('price').isFloat({ min: 0 }).withMessage('Giá ghế phải lớn hơn hoặc bằng 0'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép thêm loại ghế' });
    }

    try {
      const { loai_ghe_id, name, price } = req.body;
      const existingSeatType = await SeatType.findOne({ loai_ghe_id });
      if (existingSeatType) return res.status(400).json({ message: 'ID loại ghế đã tồn tại' });

      const seatType = new SeatType({ loai_ghe_id, name, price });
      await seatType.save();
      res.status(201).json({ message: 'Thêm loại ghế thành công', seatType });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm loại ghế', error: error.message });
    }
  }
];

const updateSeatType = [
  body('name').optional().notEmpty().withMessage('Tên loại ghế không được để trống'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Giá ghế phải lớn hơn hoặc bằng 0'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép sửa loại ghế' });
    }

    try {
      const seatType = await SeatType.findOneAndUpdate(
        { loai_ghe_id: req.params.id },
        req.body,
        { new: true }
      );
      if (!seatType) return res.status(404).json({ message: 'Không tìm thấy loại ghế' });
      res.json({ message: 'Cập nhật loại ghế thành công', seatType });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật loại ghế', error: error.message });
    }
  }
];

const deleteSeatType = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép xóa loại ghế' });
  }

  try {
    const seatType = await SeatType.findOne({ loai_ghe_id: req.params.id });
    if (!seatType) return res.status(404).json({ message: 'Không tìm thấy loại ghế' });

    const hasSeats = await Seat.findOne({ seatTypeId: seatType._id });
    if (hasSeats) return res.status(400).json({ message: 'Không thể xóa loại ghế vì có ghế liên quan' });

    await SeatType.deleteOne({ loai_ghe_id: req.params.id });
    res.json({ message: 'Xóa loại ghế thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa loại ghế', error: error.message });
  }
};

module.exports = { getSeatTypes, createSeatType, updateSeatType, deleteSeatType };