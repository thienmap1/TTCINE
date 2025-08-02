const express = require('express');
const router = express.Router();
const { bookTickets, getUserTickets, deleteTicket,getBookedSeats } = require('../controllers/ticketController');
const { requireAuth } = require('../middleware/authMiddleware'); // 🔧 THÊM middleware

router.post('/book', requireAuth, bookTickets);      // ✅ Cần auth
router.get('/',requireAuth, getUserTickets);        // ✅ Cần auth
router.delete('/:ve_id', requireAuth, deleteTicket); // ✅ Cần auth
router.get('/booked-seats/:showtimeId', getBookedSeats);

module.exports = router;
