const Showtime = require('../models/Showtime');
const { body, validationResult } = require('express-validator');

const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movieId', 'title')
      .populate('roomId', 'name');      
    res.status(200).json(showtimes);
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách suất chiếu', error: error.message });
  }
};

const createShowtime = [
  body('suat_chieu_id').isInt().withMessage('ID suất chiếu phải là số nguyên'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        suat_chieu_id,
        startTime,
        endTime,
        date,
        movieId,
        roomId
      } = req.body;

      const existing = await Showtime.findOne({ suat_chieu_id });
      if (existing) return res.status(400).json({ message: 'ID suất chiếu đã tồn tại' });

      const showtime = new Showtime({
        suat_chieu_id,
        startTime,
        endTime,
        date,
        movieId,
        roomId
      });

      await showtime.save();

      const populatedShowtime = await Showtime.findById(showtime._id)
        .populate('movieId', 'title')
        .populate('roomId', 'name');

      res.status(201).json({
        message: 'Thêm suất chiếu thành công',
        showtime: populatedShowtime
      });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi thêm suất chiếu', error: err.message });
    }
  }
];


const updateShowtime = [
  body('startTime').optional().notEmpty().withMessage('Giờ bắt đầu không được để trống'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép sửa suất chiếu' });
    }

    try {
      const showtime = await Showtime.findOneAndUpdate(
        { suat_chieu_id: req.params.id },
        req.body,
        { new: true }
      )
      .populate('movieId', 'title')
      .populate('roomId', 'name');   

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