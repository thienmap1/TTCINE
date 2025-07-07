const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Movie = require('../models/Movie');

const Genre = mongoose.model('Genre', new mongoose.Schema({
  lphim_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true }
}));

const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thể loại phim', error: error.message });
  }
};

const createGenre = [
  body('lphim_id').isInt().withMessage('ID thể loại phải là số nguyên'),
  body('name').notEmpty().withMessage('Tên thể loại là bắt buộc'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép thêm thể loại phim' });
    }

    try {
      const { lphim_id, name } = req.body;
      const existingGenre = await Genre.findOne({ lphim_id });
      if (existingGenre) return res.status(400).json({ message: 'ID thể loại đã tồn tại' });

      const genre = new Genre({ lphim_id, name });
      await genre.save();
      res.status(201).json({ message: 'Thêm thể loại phim thành công', genre });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm thể loại phim', error: error.message });
    }
  }
];

const updateGenre = [
  body('name').optional().notEmpty().withMessage('Tên thể loại không được để trống'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép sửa thể loại phim' });
    }

    try {
      const genre = await Genre.findOneAndUpdate(
        { lphim_id: req.params.id },
        req.body,
        { new: true }
      );
      if (!genre) return res.status(404).json({ message: 'Không tìm thấy thể loại phim' });
      res.json({ message: 'Cập nhật thể loại phim thành công', genre });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật thể loại phim', error: error.message });
    }
  }
];

const deleteGenre = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép xóa thể loại phim' });
  }

  try {
    const genre = await Genre.findOne({ lphim_id: req.params.id });
    if (!genre) return res.status(404).json({ message: 'Không tìm thấy thể loại phim' });

    const hasMovies = await Movie.findOne({ genreId: genre._id });
    if (hasMovies) return res.status(400).json({ message: 'Không thể xóa thể loại vì có phim liên quan' });

    await Genre.deleteOne({ lphim_id: req.params.id });
    res.json({ message: 'Xóa thể loại phim thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa thể loại phim', error: error.message });
  }
};

module.exports = { getGenres, createGenre, updateGenre, deleteGenre };