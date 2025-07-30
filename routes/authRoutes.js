const express = require('express');
const router = express.Router();
const { register, login, sendOTP, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', sendOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
