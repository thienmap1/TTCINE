const express = require('express');
const { getRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getRooms);
router.post('/', requireAuth, requireAdmin, createRoom);
router.put('/:id', requireAuth, requireAdmin, updateRoom);
router.delete('/:id', requireAuth, requireAdmin, deleteRoom);

module.exports = router;