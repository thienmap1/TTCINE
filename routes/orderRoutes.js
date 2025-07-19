const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByUser } = require('../controllers/orderController');
const { payOrder, getTicketsByOrder } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getOrdersByUser);
router.post('/:orderId/pay', requireAuth, payOrder);
router.get('/:orderId/tickets', requireAuth, getTicketsByOrder);


module.exports = router;
