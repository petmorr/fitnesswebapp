require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const path = require('path');
const mustacheExpress = require('mustache-express');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const logger = require('./config/logger'); // Assume a logger configuration exists

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Initialize and configure the Express server.
 */
(async () => {
  try {
    // Establish database connection
    const mongoose = await connectDB();
    logger.info('Database connected successfully');

    // CORS middleware to handle cross-origin requests
    app.use(cors());

    // Parse incoming requests with JSON payloads
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configure session management with MongoDB storage
    app.use(session({
      secret: process.env.JWT_SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Serve static files from the 'public' directory
    const publicDirectoryPath = path.join(__dirname, 'public');
    app.use(express.static(publicDirectoryPath));

    // Setup Mustache as the view engine for rendering HTML
    app.engine('mustache', mustacheExpress());
    app.set('view engine', 'mustache');
    app.set('views', path.join(__dirname, 'views'));

    // Apply routes
    app.use('/', userRoutes);
    app.use('/workout', workoutRoutes);

    // Start listening for requests
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
  }
})();