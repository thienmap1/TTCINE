const express = require('express');
const { getShowtimes, createShowtime, updateShowtime, deleteShowtime } = require('../controllers/showtimeController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getShowtimes);
router.post('/', requireAuth, requireAdmin, createShowtime); 
router.put('/:id', requireAuth, requireAdmin, updateShowtime); 
router.delete('/:id', requireAuth, requireAdmin, deleteShowtime); 

module.exports = router;