const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa cung cấp token hoặc token sai định dạng' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Lưu thông tin user vào req.user
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
    return res.status(401).json({ message: 'Token không hợp lệ', error: error.message });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Yêu cầu xác thực trước khi kiểm tra quyền admin' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép truy cập' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };