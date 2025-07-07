const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  suat_chieu_id: { type: Number, required: true, unique: true }, // Thêm suat_chieu_id
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  date: { type: Date, required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }
});

// Validation để kiểm tra trùng thời gian trong cùng phòng
showtimeSchema.pre('save', async function (next) {
  const existingShowtime = await this.constructor.findOne({
    roomId: this.roomId,
    date: this.date,
    $or: [
      { startTime: { $lte: this.endTime, $gte: this.startTime } },
      { endTime: { $lte: this.endTime, $gte: this.startTime } }
    ]
  });
  if (existingShowtime) {
    throw new Error('Showtime conflicts with another in the same room');
  }
  next();
});

module.exports = mongoose.model('Showtime', showtimeSchema);