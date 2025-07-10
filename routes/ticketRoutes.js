const express = require('express');
const router = express.Router();
const { bookTicket, getUserTickets } = require('../controllers/ticketController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, bookTicket);


router.get('/my', requireAuth, getUserTickets);

module.exports = router;
