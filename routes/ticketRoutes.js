// const express = require('express');
// const router = express.Router();
// const { bookTicket, getUserTickets,deleteTicket } = require('../controllers/ticketController');
// const { requireAuth } = require('../middleware/authMiddleware');


// router.post('/', requireAuth, bookTicket);
// router.get('/', requireAuth, getUserTickets);
// router.delete('/:ve_id', requireAuth, deleteTicket);
// module.exports = router;
const express = require('express');
const router = express.Router();
const { bookTickets, getUserTickets, deleteTicket } = require('../controllers/ticketController');

router.post('/book', bookTickets); // ✅ đã đổi
router.get('/', getUserTickets);
router.delete('/:ve_id', deleteTicket);
module.exports = router;