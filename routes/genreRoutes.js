const express = require('express');
const { getGenres, createGenre, updateGenre, deleteGenre } = require('../controllers/genreController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getGenres);
router.post('/', requireAuth, requireAdmin, createGenre);
router.put('/:id', requireAuth, requireAdmin, updateGenre);
router.delete('/:id', requireAuth, requireAdmin, deleteGenre);

module.exports = router;