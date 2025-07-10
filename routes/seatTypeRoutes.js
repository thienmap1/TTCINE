const express = require('express');
const { getSeatTypes, createSeatType, updateSeatType, deleteSeatType } = require('../controllers/seatTypeController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { getSeatTypeByCustomId } = require('../controllers/seatTypeController');
const controller = require('../controllers/seatTypeController');
const router = express.Router();



router.get('/', getSeatTypes);
router.get('/by-ma/:id', getSeatTypeByCustomId);
router.put('/:loai_ghe_id', controller.updateSeatType); 
router.delete('/:loai_ghe_id', controller.deleteSeatType);  

module.exports = router;
