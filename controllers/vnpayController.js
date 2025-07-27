// const qs = require('qs');
// const crypto = require('crypto');
// const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } = require('../config/vnpay');
// const Order = require('../models/Order');

// const createVnpayUrl = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     console.log('📦 orderId nhận từ client:', orderId);
//     if (!orderId) {
//       return res.status(400).json({ error: 'Thiếu orderId trong body request' });
//     }

//     // Đảm bảo kiểu số
//     const parsedOrderId = Number(orderId);
//     if (isNaN(parsedOrderId)) {
//       return res.status(400).json({ error: 'orderId không hợp lệ, phải là số' });
//     }

//     // Tìm đơn hàng theo dh_id
//     const order = await Order.findOne({ dh_id: parsedOrderId });

//     if (!order) {
//       console.error('❌ Không tìm thấy đơn hàng với dh_id:', parsedOrderId);
//       return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
//     }

//     console.log('🧾 Thông tin đơn hàng:', order);

//     const amount = order.totalAmount;
//     const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';
//     const date = new Date();
//     const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

//     const vnp_Params = {
//       vnp_Version: '2.1.0',
//       vnp_Command: 'pay',
//       vnp_TmnCode,
//       vnp_Locale: 'vn',
//       vnp_CurrCode: 'VND',
//       vnp_TxnRef: String(order.dh_id),
//       vnp_OrderInfo: 'Thanhtoanvexemphim',
//       vnp_OrderType: 'billpayment',
//       vnp_Amount: String(amount * 100),
//       vnp_ReturnUrl,
//       vnp_IpAddr: ipAddr,
//       vnp_CreateDate: createDate,
//     };


//     const sortedParams = sortObject(vnp_Params);
//     const signData = qs.stringify(sortedParams, { encode: false });

//     for (const key of Object.keys(sortedParams)) {
//   if (key.includes(' ')) {
//     console.log(`❗ Lỗi key có dấu cách: "${key}"`);
//   }
// }

//     const hmac = crypto.createHmac('sha512', vnp_HashSecret);
//     const signed = hmac.update(signData, 'utf-8').digest('hex');

//     console.log('🔐 chữ ký tạo ra:', signed);

//     sortedParams.vnp_SecureHash = signed;

//     const paymentUrl = `${vnp_Url}?${qs.stringify(sortedParams, { encode: false })}`;

//     console.log('✅ paymentUrl trả về:', paymentUrl);

//     res.json({ paymentUrl });

//   } catch (error) {
//     console.error('❌ Lỗi tạo URL VNPAY:', error.message);
//     console.error(error.stack);
//     res.status(500).json({ error: 'Không thể tạo URL thanh toán', message: error.message });
//   }
// };

// function sortObject(obj) {
//   const sorted = {};
//   const keys = Object.keys(obj).sort();
//   for (const key of keys) {
//     const trimmedKey = key.trim();
//     if (trimmedKey !== key) {
//       console.warn(`⚠️ Key bị thừa dấu cách: "${key}" → sẽ dùng "${trimmedKey}"`);
//     }
//     sorted[trimmedKey] = obj[key];
//   }
//   return sorted;
// }

// module.exports = { createVnpayUrl };
const qs = require('qs');
const crypto = require('crypto');
const moment = require('moment-timezone');
const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } = require('../config/vnpay');
const Order = require('../models/Order');
const {VNPay, ignoreLogger, ProductCode,VnpLocale,dateFormat}=require('vnpay');


export const payment = async (req, res) => {
  try { 

    const vnpay = new VNPay({
      tmnCode: 'MBL6AAFV',
      hashSecret:  'L4VPBXWOTOTODLY4S5N5OSUOUYXO53C2',
      vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      testMode: true,
      hashAlgorithm: 'SHA512',
      loggerFn: ignoreLogger,
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: 100 * 100,
      vnp_IpAddr:'127.0.0.1',
      vnp_TxnRef: 'orderId',
      vnp_OrderInfo: 'Thanhtoanvexemphim',
      vnp_OrderType: 'billpayment',
      vnp_ReturnUrl: 'https://abcd1234.ngrok.io/api/vnpay_return',
      vnp_Locale: vnp_Locale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });
    return res.status(200).json(vnpayResponse);
  } catch (error) {
    console.error('❌ Lỗi tạo URL VNPAY:', error.message);
  }
}

       // VNPAY yêu cầu amount nhân 100
// const createVnpayUrl = async (req, res) => {
//   try {
//     const { orderId, bankCode } = req.body;

//     if (!orderId) {
//       return res.status(400).json({ error: 'Thiếu orderId trong body request' });
//     }

//     const parsedOrderId = Number(orderId);
//     if (isNaN(parsedOrderId)) {
//       return res.status(400).json({ error: 'orderId không hợp lệ, phải là số' });
//     }

//     const order = await Order.findOne({ dh_id: parsedOrderId });
//     if (!order) {
//       return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
//     }

//     const amount = order.totalAmount;

//     // Xử lý IP - loại bỏ IPv6 prefix nếu có
//     let ipAddr = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || req.connection?.socket?.remoteAddress || '';
//     if (ipAddr && ipAddr.startsWith('::ffff:')) {
//       ipAddr = ipAddr.substring(7);
//     }
//     ipAddr = ipAddr.trim();

//     const createDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');

//     // Tạo object params chuẩn
//     const vnp_Params = {
//       vnp_Version: '2.1.0',
//       vnp_Command: 'pay',
//       vnp_TmnCode,
//       vnp_Locale: 'vn',
//       vnp_CurrCode: 'VND',
//       vnp_TxnRef: String(order.dh_id),
//       vnp_OrderInfo: 'Thanhtoanvexemphim',
//       vnp_OrderType: 'billpayment',
//       vnp_Amount: String(amount * 100), // VNPAY yêu cầu amount nhân 100
//       vnp_ReturnUrl,
//       vnp_IpAddr: ipAddr,
//       vnp_CreateDate: createDate,
//     };

//     if (bankCode && bankCode.trim() !== '') {
//       vnp_Params.vnp_BankCode = bankCode.trim();
//     }

//     // Sắp xếp params
//     const sortedParams = sortObject(vnp_Params);
//     console.log('🔍 sortedParams:', sortedParams);


//     // Tạo chuỗi ký (chú ý: không encode các ký tự đặc biệt)
//     const signData = qs.stringify(sortedParams, { encode: false });
//     console.log('🔗 signData:', signData); // debug: kiểm tra chuỗi ký
//     // Tạo chữ ký HMAC SHA512
//     console.log('🔑 vnp_HashSecret (secret key):', JSON.stringify(vnp_HashSecret));
//     const hmac = crypto.createHmac('sha512', vnp_HashSecret.trim());
//     const signed = hmac.update(signData, 'utf8').digest('hex');
//     console.log('🔐 chữ ký (signed):', signed);


//     console.log('chữ ký:', signed); // debug: chữ ký

//     // Thêm chữ ký vào params
//     sortedParams.vnp_SecureHash = signed;

//     // Tạo URL thanh toán
//     const paymentUrl = `${vnp_Url}?${qs.stringify(sortedParams, { encode: false })}`;

//     console.log('paymentUrl:', paymentUrl); // debug: url thanh toán

//     return res.json({ paymentUrl });

//   } catch (error) {
//     console.error('Lỗi tạo URL VNPAY:', error);
//     return res.status(500).json({ error: 'Không thể tạo URL thanh toán', message: error.message });
//   }
// };

// function sortObject(obj) {
//   const sorted = {};
//   Object.keys(obj)
//     .sort()
//     .forEach(key => {
//       const value = obj[key];
//       sorted[key.trim()] = typeof value === 'string' ? value.trim() : value;
//     });
//   return sorted;
// }

// module.exports = { createVnpayUrl };
