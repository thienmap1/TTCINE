const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  phim_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  language: { type: String, required: true },
  subtitle: { type: String },
  label: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true, min: 1 },
  releaseDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  genreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre', required: true }
});

module.exports = mongoose.model('Movie', movieSchema);