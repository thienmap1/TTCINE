const express = require('express');
const router = express.Router();
const { getAllGenres } = require('../controllers/genreController');

router.get('/', getAllGenres);

module.exports = router;
