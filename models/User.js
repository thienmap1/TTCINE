const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  kh_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, maxLength: 15, unique: true },
  password: { type: String, required: true },
  dob: { type: Date },
  isStudent: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

module.exports = mongoose.model('User', userSchema);
