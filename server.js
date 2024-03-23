require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const path = require('path');
const publicDirectoryPath = path.join(__dirname, 'public');
const mustacheExpress = require('mustache-express');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    const mongoose = await connectDB();
    console.log('Database connected, starting server...');

    app.use(cors());

    // Parse JSON bodies
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

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
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      }
    }));

    // Serving static files
    app.use(express.static(publicDirectoryPath));

    // Setting up Mustache as the view engine
    app.engine('mustache', mustacheExpress());
    app.set('view engine', 'mustache');
    app.set('views', __dirname + '/views');

    // Routes
    app.use('/', userRoutes);
    app.use('/workout', workoutRoutes);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
})();