const QRCode = require('qrcode');

exports.generateQR = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (err) {
    throw new Error('Không tạo được mã QR');
  }
};
