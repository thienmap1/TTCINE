const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// ===================== REGISTER =====================
const register = [
  body('name').notEmpty().withMessage('Tên là bắt buộc'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, dob, isStudent, role, phone } = req.body;

      const existingUser = await User.findOne({ $or: [{ email },] });
      if (existingUser) {
        return res.status(400).json({ message: 'Email hoặc ID đã tồn tại' });
      }
      const user = new User({ name, email, password, dob, isStudent, role, phone });
      await user.save();
      res.status(201).json({ message: 'Đăng ký success' });
    } catch (err) {
      console.error('🔥 Lỗi trong register:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  }
];

// ===================== LOGIN =====================
const login = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }

      if (password !== user.password) {
        return res.status(401).json({ message: 'Sai mật khẩu' });
      }
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error('🔥 Lỗi trong login:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  }
];
const sendOTP = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      console.log(`📩 OTP gửi đến ${email}: ${otp}`);

      res.json({ message: 'OTP đã được gửi tới email (in ra console)' });
    } catch (err) {
      console.error('🔥 Lỗi gửi OTP:', err);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
];
const resetPassword = [
  body('email').isEmail(),
  body('otp').notEmpty().withMessage('OTP là bắt buộc'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, otp, newPassword } = req.body;
      const user = await User.findOne({ email });

      if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
      }

      user.password = newPassword; // KHÔNG MÃ HÓA
      user.otp = undefined;
      user.otpExpires = undefined;

      await user.save();

      res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
      console.error('🔥 Lỗi reset mật khẩu:', err);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
];


module.exports = {
  register,
  login,
  sendOTP,
  resetPassword
};
