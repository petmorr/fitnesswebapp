require('dotenv').config();
const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const connectDB = require('./config/db');
connectDB();

// Serving static files
const publicDirectoryPath = path.join(__dirname, 'public');
app.use(express.static(publicDirectoryPath));

// Setting up Mustache as the view engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// User routes
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));