const express = require('express');
const router = express.Router();
const { payment } = require('../controllers/vnpayController');
const { vnpayReturn } = require('../controllers/vnpayReturn');

router.post('/create_payment', payment);
// router.get('/vnpay_return', vnpayReturn);

module.exports = router;
