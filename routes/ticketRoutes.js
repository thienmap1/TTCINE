const express = require('express');
const router = express.Router();
const { bookTicket, getUserTickets,deleteTicket } = require('../controllers/ticketController');
const { requireAuth } = require('../middleware/authMiddleware');


router.post('/', requireAuth, bookTicket);
router.get('/', requireAuth, getUserTickets);
router.delete('/:ve_id', requireAuth, deleteTicket);
module.exports = router;
