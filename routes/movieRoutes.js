
const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');

const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllMovies);

router.get('/:id', getMovieById);

router.post('/', requireAuth, requireAdmin, ...createMovie);

router.put('/:id', requireAuth, requireAdmin, ...updateMovie);


router.delete('/:id', requireAuth, requireAdmin, deleteMovie);

module.exports = router;
