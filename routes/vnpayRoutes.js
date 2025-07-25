const express = require('express');
const router = express.Router();
const { createVnpayUrl } = require('../controllers/vnpayController');
const { vnpayReturn } = require('../controllers/vnpayReturn');

router.post('/create_payment', createVnpayUrl);
router.get('/vnpay_return', vnpayReturn);

module.exports = router;
