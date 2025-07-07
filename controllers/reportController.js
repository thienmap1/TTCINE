const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Room = require('../models/Room');

const getRevenueByTime = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép xem báo cáo' });
  }

  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate && endDate) {
      match.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const revenue = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      message: 'Thống kê doanh thu thành công',
      revenue: revenue[0]?.totalRevenue || 0,
      orderCount: revenue[0]?.orderCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thống kê doanh thu', error: error.message });
  }
};

const getRevenueByMovie = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép xem báo cáo' });
  }

  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate && endDate) {
      match.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const revenue = await Order.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'orderId',
          as: 'tickets'
        }
      },
      { $unwind: '$tickets' },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'tickets.showtimeId',
          foreignField: '_id',
          as: 'showtime'
        }
      },
      { $unwind: '$showtime' },
      {
        $lookup: {
          from: 'movies',
          localField: 'showtime.movieId',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $group: {
          _id: '$movie.phim_id',
          movieTitle: { $first: '$movie.title' },
          totalRevenue: { $sum: '$totalAmount' },
          ticketCount: { $sum: 1 }
        }
      }
    ]);

    res.json({ message: 'Thống kê doanh thu theo phim thành công', revenue });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thống kê doanh thu theo phim', error: error.message });
  }
};

const getRevenueByRoom = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép xem báo cáo' });
  }

  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate && endDate) {
      match.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const revenue = await Order.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'orderId',
          as: 'tickets'
        }
      },
      { $unwind: '$tickets' },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'tickets.showtimeId',
          foreignField: '_id',
          as: 'showtime'
        }
      },
      { $unwind: '$showtime' },
      {
        $lookup: {
          from: 'rooms',
          localField: 'showtime.roomId',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $group: {
          _id: '$room.phong_id',
          roomName: { $first: '$room.name' },
          totalRevenue: { $sum: '$totalAmount' },
          ticketCount: { $sum: 1 }
        }
      }
    ]);

    res.json({ message: 'Thống kê doanh thu theo phòng thành công', revenue });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thống kê doanh thu theo phòng', error: error.message });
  }
};

module.exports = { getRevenueByTime, getRevenueByMovie, getRevenueByRoom };