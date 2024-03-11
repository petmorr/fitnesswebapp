require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.use(express.json());
app.use(express.static('public'));

const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));