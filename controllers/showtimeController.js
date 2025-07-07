const Showtime = require('../models/Showtime');
const { body, validationResult } = require('express-validator');

const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find().populate('movieId roomId');
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách suất chiếu', error: error.message });
  }
};

const createShowtime = [
  body('suat_chieu_id').isInt().withMessage('ID suất chiếu phải là số nguyên'),
  body('startTime').notEmpty().withMessage('Giờ bắt đầu là bắt buộc'),
  body('date').isDate().withMessage('Ngày chiếu không hợp lệ'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ admin được phép thêm suất chiếu' });

    try {
      const { suat_chieu_id, startTime, endTime, date, movieId, roomId } = req.body;
      const showtime = new Showtime({ suat_chieu_id, startTime, endTime, date, movieId, roomId });
      await showtime.save();
      res.status(201).json({ message: 'Thêm suất chiếu thành công', showtime });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm suất chiếu', error: error.message });
    }
  }
];

const updateShowtime = [
  body('startTime').optional().notEmpty().withMessage('Giờ bắt đầu không được để trống'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ admin được phép sửa suất chiếu' });

    try {
      const showtime = await Showtime.findOneAndUpdate({ suat_chieu_id: req.params.id }, req.body, { new: true });
      if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
      res.json({ message: 'Cập nhật suất chiếu thành công', showtime });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật suất chiếu', error: error.message });
    }
  }
];

const deleteShowtime = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ admin được phép xóa suất chiếu' });

  try {
    const showtime = await Showtime.findOneAndDelete({ suat_chieu_id: req.params.id });
    if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    res.json({ message: 'Xóa suất chiếu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa suất chiếu', error: error.message });
  }
};

module.exports = { getShowtimes, createShowtime, updateShowtime, deleteShowtime };