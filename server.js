require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const path = require('path');
const public = path.join(__dirname, 'public');
app.use(express.static(public));

const mustacheExpress = require('mustache-express');
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));