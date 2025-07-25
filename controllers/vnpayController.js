const qs = require('qs');
const crypto = require('crypto');
const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } = require('../config/vnpay');
const Order = require('../models/Order');

const createVnpayUrl = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log('📦 orderId nhận từ client:', orderId);
    if (!orderId) {
      return res.status(400).json({ error: 'Thiếu orderId trong body request' });
    }

    // Đảm bảo kiểu số
    const parsedOrderId = Number(orderId);
    if (isNaN(parsedOrderId)) {
      return res.status(400).json({ error: 'orderId không hợp lệ, phải là số' });
    }

    // Tìm đơn hàng theo dh_id
    const order = await Order.findOne({ dh_id: parsedOrderId });

    if (!order) {
      console.error('❌ Không tìm thấy đơn hàng với dh_id:', parsedOrderId);
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    console.log('🧾 Thông tin đơn hàng:', order);

    const amount = order.totalAmount;
    const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: String(order.dh_id),
      vnp_OrderInfo: 'Thanhtoanvexemphim',
      vnp_OrderType: 'billpayment',
      vnp_Amount: String(amount * 100),
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });

    console.log('🧩 signData:', signData);

    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(signData, 'utf-8').digest('hex');

    console.log('🔐 chữ ký tạo ra:', signed);

    sortedParams.vnp_SecureHash = signed;

    const paymentUrl = `${vnp_Url}?${qs.stringify(sortedParams, { encode: false })}`;

    console.log('✅ paymentUrl trả về:', paymentUrl);

    res.json({ paymentUrl });

  } catch (error) {
    console.error('❌ Lỗi tạo URL VNPAY:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Không thể tạo URL thanh toán', message: error.message });
  }
};

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) sorted[key] = obj[key];
  return sorted;
}

module.exports = { createVnpayUrl };
