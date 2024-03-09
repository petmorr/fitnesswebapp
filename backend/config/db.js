require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async (retryCount = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    if (retryCount > 0) {
      console.log(`Retrying to connect... Attempts left: ${retryCount}`);
      // Wait for 5 seconds before trying to reconnect
      setTimeout(() => connectDB(retryCount - 1), 5000);
    } else {
      console.log('Failed to connect to MongoDB after several attempts');
      console.error(err);
    }
  }
};

module.exports = connectDB;