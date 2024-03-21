const mongoose = require('mongoose');

const connectDB = async (retryCount = 5) => {
  if (retryCount === 0) {
    console.log('Failed to connect to MongoDB after several attempts');
    return Promise.reject('Failed to connect to MongoDB');
  }

  return mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      return mongoose; // Return mongoose to allow for chaining or direct use
    })
    .catch((err) => {
      console.error(err.message);
      console.log(`Retrying to connect... Attempts left: ${retryCount - 1}`);
      // Wait for 5 seconds before trying to reconnect
      return new Promise(resolve => setTimeout(resolve, 5000))
        .then(() => connectDB(retryCount - 1));
    });
};

module.exports = connectDB;