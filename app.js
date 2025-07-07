const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Movie Ticket Backend is running');
});

module.exports = app;
