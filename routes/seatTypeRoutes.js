const express = require('express');
const { getSeatTypes, createSeatType, updateSeatType, deleteSeatType } = require('../controllers/seatTypeController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getSeatTypes);
router.post('/', requireAuth, requireAdmin, createSeatType);
router.put('/:id', requireAuth, requireAdmin, updateSeatType);
router.delete('/:id', requireAuth, requireAdmin, deleteSeatType);

module.exports = router;