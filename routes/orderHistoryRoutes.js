
const express = require('express');
const router = express.Router();
const { addOrderHistory, getOrderHistory } = require('../controllers/orderHistoryController');

router.post('/', addOrderHistory);
router.get('/:orderId', getOrderHistory);

module.exports = router;
