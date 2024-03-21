require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS and Cookie Parser Config
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// MongoDB Connection
const connectDB = require('./config/db');
connectDB();

// Serving static files
const path = require('path');
const publicDirectoryPath = path.join(__dirname, 'public');
app.use(express.static(publicDirectoryPath));

// Setting up Mustache as the view engine
const mustacheExpress = require('mustache-express');
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// User routes
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));