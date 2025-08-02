const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const roomRoutes = require('./routes/roomRoutes');
const seatTypeRoutes = require('./routes/seatTypeRoutes');
const seatRoutes = require('./routes/seatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const genreRoutes = require('./routes/genreRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderHistoryRoutes = require('./routes/orderHistoryRoutes');
const vnpayRoutes = require('./routes/vnpayRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Cron job xử lý đơn hàng quá hạn
const clearExpiredOrders = require('./clearExpiredOrders');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route mount
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/seat-types', seatTypeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-history', orderHistoryRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/vnpay', vnpayRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/', (req, res) => res.send('Movie Ticket Backend is running'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Lỗi server', error: err.message });
});

// Kết nối MongoDB và khởi chạy server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    // 👉 Gọi clearExpiredOrders mỗi 5 phút (300,000 ms)
    setInterval(() => {
      console.log('[CRON] Kiểm tra đơn hàng quá hạn...');
      clearExpiredOrders();
    }, 5 * 60 * 1000);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
