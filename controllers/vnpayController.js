// const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require("vnpay")

// const createVNPAYOder = async (req, res) => {
//   const { amountOrder, idOrder } = req.body
//   const vnpay = new VNPay({
//     tmnCode: "GULKO9FP",
//     secureSecret: "O9WTQBZVY5IT646J2GCM7AT9SGUHTPYF",
//     vnpayHost: "https://sandbox.vnpayment.vn",
//     testMode: true, // tùy chọn
//     hashAlgorithm: "SHA512", // tùy chọn
//     loggerFn: ignoreLogger, // tùy chọn
//   })

//   const tomorrow = new Date()
//   tomorrow.setDate(tomorrow.getDate() + 1)
//   const vnpayResponse = await vnpay.buildPaymentUrl({
//     vnp_Amount: amountOrder, //
//     vnp_IpAddr: "127.0.0.1", //
//     vnp_TxnRef: `${idOrder}`, // Sử dụng paymentId thay vì singlePaymentId
//     vnp_OrderInfo: `${idOrder} `,
//     vnp_OrderType: ProductCode.Other,
//     vnp_ReturnUrl: `http://localhost:5000/api/payment/vnpay/callback`, //
//     vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
//     vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
//     vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
//   })
//   return res.status(200).json({
//     status: "success",
//     message: "Tạo đơn hàng thành công",
//     data: {
//       vnpayUrl: vnpayResponse,
//     },
//   })
// }

// const callbackVNPAY = async (req, res) => {
//   const { vnp_ResponseCode, vnp_TxnRef } = req.query
// }

// module.exports = { createVNPAYOder, callbackVNPAY }
const Order = require('../models/Order');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require("vnpay");

const createVNPAYOder = async (req, res) => {
  try {
    const { idOrder } = req.body;

    if (!idOrder) {
      return res.status(400).json({ status: "fail", message: "Thiếu idOrder" });
    }

    // 🔍 Tìm đơn hàng trong MongoDB theo dh_id
    const order = await Order.findOne({ dh_id: idOrder });
    if (!order) {
      return res.status(404).json({ status: "fail", message: "Không tìm thấy đơn hàng" });
    }

    // ⚙️ Khởi tạo đối tượng VNPay
    const vnpay = new VNPay({
      tmnCode: "GULKO9FP",
      secureSecret: "O9WTQBZVY5IT646J2GCM7AT9SGUHTPYF",
      vnpayHost: "https://sandbox.vnpayment.vn",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    // 🕒 Thời gian hết hạn thanh toán (ngày mai)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 🌐 Tạo URL thanh toán
    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: order.totalAmount * 100, // VNPAY yêu cầu số tiền tính bằng đồng
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: String(order.dh_id),
      vnp_OrderInfo: `Thanh toán đơn hàng #${order.dh_id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `http://localhost:5000/api/payment/vnpay/callback`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    return res.status(200).json({
      status: "success",
      message: "Tạo URL thanh toán thành công",
      data: {
        vnpayUrl: vnpayResponse,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi tạo URL VNPAY:", error);
    res.status(500).json({
      status: "error",
      message: "Không thể tạo URL thanh toán",
    });
  }
};

const callbackVNPAY = async (req, res) => {
  const { vnp_ResponseCode, vnp_TxnRef } = req.query;
  // TODO: xử lý callback sau thanh toán nếu cần
  return res.send('✅ Đã nhận callback từ VNPAY');
};

module.exports = { createVNPAYOder, callbackVNPAY };
