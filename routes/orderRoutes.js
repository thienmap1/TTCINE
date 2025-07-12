const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByUser } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getOrdersByUser);

module.exports = router;
