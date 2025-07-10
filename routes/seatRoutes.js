const express = require('express');
const { getSeats, createSeat, updateSeat, deleteSeat } = require('../controllers/seatController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getSeats);
router.post('/', requireAuth, requireAdmin, createSeat);
router.put('/:ghe_id', requireAuth, requireAdmin, updateSeat);
router.delete('/:ghe_id', requireAuth, requireAdmin, deleteSeat);

module.exports = router;