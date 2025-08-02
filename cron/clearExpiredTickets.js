
const Ticket = require('../models/Ticket');

const clearExpiredTickets = async () => {
  const TIMEOUT_MINUTES = 15;
  const timeoutDate = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

  const result = await Ticket.deleteMany({
    status: 'pending',
    createdAt: { $lt: timeoutDate }
  });

  console.log(`[CRON] Đã xoá ${result.deletedCount} vé pending quá hạn`);
};

module.exports = clearExpiredTickets;
