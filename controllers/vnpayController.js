
// const Order = require('../models/Order');
// const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require("vnpay");

// const createVNPAYOder = async (req, res) => {
//   try {
//     const { idOrder } = req.body;

//     if (!idOrder) {
//       return res.status(400).json({ status: "fail", message: "Thiếu idOrder" });
//     }

//     // 🔍 Tìm đơn hàng trong MongoDB theo dh_id
//     const order = await Order.findOne({ dh_id: idOrder });
//     if (!order) {
//       return res.status(404).json({ status: "fail", message: "Không tìm thấy đơn hàng" });
//     }

//     // ⚙️ Khởi tạo đối tượng VNPay
//     const vnpay = new VNPay({
//       tmnCode: "MBL6AAFV",
//       secureSecret: "L4VPBXWOTOTODLY4S5N5OSUOUYXO53C2",
//       vnpayHost: "https://sandbox.vnpayment.vn",
//       testMode: true,
//       hashAlgorithm: "SHA512",
//       loggerFn: ignoreLogger,
//     });

//     // 🕒 Thời gian hết hạn thanh toán (ngày mai)
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // 🌐 Tạo URL thanh toán
//     const vnpayResponse = await vnpay.buildPaymentUrl({
//       vnp_Amount: order.totalAmount, // VNPAY yêu cầu số tiền tính bằng đồng
//       vnp_IpAddr: req.ip || "127.0.0.1",
//       vnp_TxnRef: String(order.dh_id),
//       vnp_OrderInfo: `Thanh toán đơn hàng #${order.dh_id}`,
//       vnp_OrderType: ProductCode.Other,
//       vnp_ReturnUrl:'http://localhost:5000/api/vnpay/vnpay_return',
//       vnp_Locale: VnpLocale.VN,
//       vnp_CreateDate: dateFormat(new Date()),
//       vnp_ExpireDate: dateFormat(tomorrow),
//     });

//     return res.status(200).json({
//       status: "success",
//       message: "Tạo URL thanh toán thành công",
//       data: {
//         vnpayUrl: vnpayResponse,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Lỗi tạo URL VNPAY:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Không thể tạo URL thanh toán",
//     });
//   }
// };

// const callbackVNPAY = async (req, res) => {
//   const { vnp_ResponseCode, vnp_TxnRef } = req.query;
//   // TODO: xử lý callback sau thanh toán nếu cần
//   return res.send('✅ Đã nhận callback từ VNPAY');
// };

// module.exports = { createVNPAYOder, callbackVNPAY };
const Order = require("../models/Order");
const OrderHistory = require("../models/OrderHistory");
const Ticket = require("../models/Ticket");
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

const createVNPAYOder = async (req, res) => {
  try {
    const { idOrder } = req.body;

    if (!idOrder) {
      return res.status(400).json({ status: "fail", message: "Thiếu idOrder" });
    }

    const order = await Order.findOne({ dh_id: idOrder });
    if (!order) {
      return res.status(404).json({ status: "fail", message: "Không tìm thấy đơn hàng" });
    }

    const vnpay = new VNPay({
      tmnCode: "MBL6AAFV",
      secureSecret: "L4VPBXWOTOTODLY4S5N5OSUOUYXO53C2",
      vnpayHost: "https://sandbox.vnpayment.vn",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: order.totalAmount,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: String(order.dh_id),
      vnp_OrderInfo: `Thanh toán đơn hàng #${order.dh_id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:5000/api/vnpay/vnpay_return",
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
  try {
    const { vnp_ResponseCode, vnp_TxnRef } = req.query;

    if (!vnp_ResponseCode || !vnp_TxnRef) {
      return res.status(400).send("Thiếu thông tin phản hồi từ VNPAY");
    }

    // Nếu thanh toán thành công
    if (vnp_ResponseCode === "00") {
      const order = await Order.findOne({ dh_id: Number(vnp_TxnRef) });
      if (order) {
        // ✅ Cập nhật trạng thái đơn hàng
        order.status = "paid";
        await order.save();

        // ✅ Cập nhật trạng thái các vé trong đơn hàng
        await Ticket.updateMany(
          { orderId: order._id },
          { status: "paid" }
        );

        // ✅ Ghi nhận lịch sử thanh toán
        await OrderHistory.create({
          lsdh_id: Date.now(),
          orderId: order._id,
          status: "paid",
          timestamp: new Date()
        });
      }
    }

    // ✅ Chuyển hướng về frontend
    return res.redirect(`http://localhost:5173/booking/confirm?vnp_ResponseCode=${vnp_ResponseCode}&idOrder=${vnp_TxnRef}`);
  } catch (error) {
    console.error("❌ Lỗi callback VNPAY:", error);
    return res.status(500).send("Lỗi callback VNPAY");
  }
};


module.exports = { createVNPAYOder, callbackVNPAY };
