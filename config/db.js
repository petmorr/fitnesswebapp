const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Attempts to connect to MongoDB with retries on failure.
 * @param {number} retryCount - Maximum number of connection attempts.
 * @returns {Promise} Resolves with the mongoose instance or rejects with an error.
 */
const connectDB = async (retryCount = 5) => {
  // Base case for recursive retry logic
  if (retryCount === 0) {
    logger.error('Failed to connect to MongoDB after several attempts');
    return Promise.reject(new Error('Failed to connect to MongoDB'));
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    logger.info('MongoDB connected successfully');
    return mongoose; // Return mongoose to allow for chaining or direct use
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    logger.info(`Retrying to connect... Attempts left: ${retryCount - 1}`);

    // Wait for 5 seconds before retrying
    await delay(5000);
    return connectDB(retryCount - 1);
  }
};

/**
 * Delays execution for a specified amount of milliseconds.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise} Promise that resolves after the delay.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = connectDB;