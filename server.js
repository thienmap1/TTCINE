const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const roomRoutes = require('./routes/roomRoutes');
const seatTypeRoutes = require('./routes/seatTypeRoutes');
const seatRoutes = require('./routes/seatRoutes');
const genreRoutes = require('./routes/genreRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/seat-types', seatTypeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/reports', reportRoutes);


app.get('/', (req, res) => res.send('Movie Ticket Backend is running'));


app.use((err, req, res, next) => {
  console.error(' Server error:', err.stack);
  res.status(500).json({ message: 'Lỗi server', error: err.message });
});


mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log(' MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${{PORT}}`);
});
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  });