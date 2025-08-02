const Order = require('./models/Order');
const Ticket = require('./models/Ticket');

async function clearExpiredOrders() {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const expiredOrders = await Order.find({
      status: 'pending',
      orderDate: { $lt: fifteenMinutesAgo }
    });

    if (expiredOrders.length === 0) {
      console.log('[CRON] Không có đơn hàng quá hạn nào');
      return;
    }

    for (const order of expiredOrders) {
      const deleted = await Ticket.deleteMany({ orderId: order._id });
      console.log(`[CRON] Đã xoá ${deleted.deletedCount} vé cho đơn hàng ${order.dh_id}`);

      order.status = 'cancelled';
      await order.save();
      console.log(`[CRON] Đã huỷ đơn hàng ${order.dh_id}`);
    }

    console.log(' Đã xử lý clearExpiredOrders');
  } catch (err) {
    console.error(' Lỗi khi xoá đơn hàng quá hạn:', err);
  }
}

clearExpiredOrders();
