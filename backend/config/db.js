require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    // Handle the error more appropriately, such as retry mechanisms or logging errors
    // instead of exiting the process immediately
    process.exit(1);
  }
};

module.exports = connectDB;