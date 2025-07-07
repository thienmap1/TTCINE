const express = require('express');
const { getRevenueByTime, getRevenueByMovie, getRevenueByRoom } = require('../controllers/reportController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/revenue-by-time', requireAuth, requireAdmin, getRevenueByTime);
router.get('/revenue-by-movie', requireAuth, requireAdmin, getRevenueByMovie);
router.get('/revenue-by-room', requireAuth, requireAdmin, getRevenueByRoom);

module.exports = router;