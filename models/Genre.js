const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  lphim_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true }
});

module.exports = mongoose.model('Genre', genreSchema);