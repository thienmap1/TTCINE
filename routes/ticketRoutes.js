const express = require('express');
const router = express.Router();
const { bookTickets, getUserTickets, deleteTicket } = require('../controllers/ticketController');
const { requireAuth } = require('../middleware/authMiddleware'); // 🔧 THÊM middleware

router.post('/book', requireAuth, bookTickets);      // ✅ Cần auth
router.get('/', requireAuth, getUserTickets);        // ✅ Cần auth
router.delete('/:ve_id', requireAuth, deleteTicket); // ✅ Cần auth

module.exports = router;
