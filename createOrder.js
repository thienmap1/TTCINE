require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const expiredTime = new Date(Date.now() - 30 * 60 * 1000);; // Cách đây 20 phút

    const newOrder = await Order.create({
      dh_id: Math.floor(Math.random() * 1000000),
      userId: '686cfc978fea915b048ba415',
      orderDate: expiredTime,  // 👈 Quan trọng: cho quá hạn 20 phút
      totalAmount: 100000,
      qrCode: 'data:image/png;base64,...',
      status: 'pending',
    });

    console.log('✅ Tạo đơn hàng quá hạn thành công:', newOrder);
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Lỗi:', err);
  });
