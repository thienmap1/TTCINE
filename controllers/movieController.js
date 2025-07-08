const Movie = require('../models/Movie');
const { body, validationResult } = require('express-validator');

const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phim', error: err.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findOne({ phim_id: req.params.id })
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết phim', error: err.message });
  }
};

const createMovie = [
  body('phim_id').isInt().withMessage('ID phim phải là số nguyên'),
  body('title').notEmpty().withMessage('Tên phim là bắt buộc'),
  body('duration').isInt({ min: 1 }).withMessage('Thời lượng phải lớn hơn 0'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ admin được phép thêm phim' });

    try {
      const { phim_id, title, language, subtitle, label, description, duration, releaseDate, endDate, genre, director, actors, poster, trailer } = req.body;
      const existingMovie = await Movie.findOne({ phim_id });
      if (existingMovie) return res.status(400).json({ message: 'ID phim đã tồn tại' });

      const movie = new Movie({ phim_id, title, language, subtitle, label, description, duration, releaseDate, endDate, genre, director, actors, poster, trailer });
      await movie.save();
      res.status(201).json({ message: 'Thêm phim thành công', movie });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi thêm phim', error: err.message });
    }
  }
];

const updateMovie = [
  body('title').optional().notEmpty().withMessage('Tên phim không được để trống'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ admin được phép sửa phim' });

    try {
      const movie = await Movie.findOneAndUpdate({ phim_id: req.params.id }, req.body, { new: true });
      if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
      res.status(200).json({ message: 'Cập nhật phim thành công', movie });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi cập nhật phim', error: err.message });
    }
  }
];

const deleteMovie = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ admin được phép xóa phim' });

  try {
    const movie = await Movie.findOneAndDelete({ phim_id: req.params.id });
    if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
    res.status(200).json({ message: 'Xóa phim thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa phim', error: err.message });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };