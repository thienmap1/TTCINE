const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// ===================== REGISTER =====================
const register = [
  body('kh_id').isInt().withMessage('ID phải là số nguyên'),
  body('name').notEmpty().withMessage('Tên là bắt buộc'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { kh_id, name, email, password, dob, isStudent, role, phone } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { kh_id }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Email hoặc ID đã tồn tại' });
      }
      const user = new User({ kh_id, name, email, password, dob, isStudent, role, phone });
      await user.save();
      console.log('✅ Đăng ký thành công:', email);
      res.status(201).json({ message: 'Đăng ký thành công' });
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
        console.log('❌ Không tìm thấy user với email:', email);
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }

      if (password !== user.password) {
        console.log('❌ Mật khẩu không khớp');
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

module.exports = { register, login };
