require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const messageRoutes = require('./routes/messages');

// import our background job
const startNotificationChecker = require('./jobs/notificationChecker');

const app = express();
app.use(express.json());

app.use('/messages', messageRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unread_service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB connected');
    
    // Start background cron job after DB is connected
    startNotificationChecker();

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
