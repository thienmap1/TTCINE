const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB for seeding');

    await Movie.deleteMany();

    await Movie.insertMany([
      { title: 'Inception', description: 'Khoa học viễn tưởng', genre: 'Sci-fi', duration: 148, releaseDate: new Date('2010-07-16') },
      { title: 'Avengers: Endgame', description: 'Siêu anh hùng', genre: 'Action', duration: 181, releaseDate: new Date('2019-04-26') }
    ]);

    console.log('🎉 Seed xong dữ liệu phim');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
