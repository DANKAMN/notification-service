require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const messageRoutes = require('./routes/messages');

const app = express();
app.use(express.json());

app.use('/messages', messageRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unread_service')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
