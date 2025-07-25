const { vnp_HashSecret } = require('../config/vnpay');
const qs = require('qs');
const crypto = require('crypto');
const Order = require('../models/Order');
const OrderHistory = require('../models/OrderHistory');

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) sorted[key] = obj[key];
  return sorted;
}

const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params.vnp_SecureHash;

    // Xoá các trường không cần ký
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });

    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(signData, 'utf-8').digest('hex');

    // Log kiểm tra
    console.log('🧩 signData:', signData);
    console.log('🔐 Chữ ký tạo ra:', signed);
    console.log('🔑 Chữ ký từ VNPAY:', secureHash);

    if (secureHash === signed) {
      const orderId = parseInt(vnp_Params.vnp_TxnRef);
      const order = await Order.findOne({ dh_id: orderId });

      if (!order) {
        return res.status(404).send('❌ Không tìm thấy đơn hàng');
      }

      await OrderHistory.create({
        lsdh_id: Date.now(),
        orderId: order._id,
        status: 'paid',
        timestamp: new Date()
      });

      // Bạn có thể redirect về FE hoặc trả về HTML
      return res.send('✅ Thanh toán thành công!');
    } else {
      return res.status(400).send('❌ Chữ ký không hợp lệ!');
    }
  } catch (error) {
    console.error('❌ Lỗi xử lý VNPAY Return:', error);
    return res.status(500).send('❌ Lỗi xử lý thanh toán: ' + error.message);
  }
};

module.exports = { vnpayReturn };
