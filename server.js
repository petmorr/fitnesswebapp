const express = require('express');
const connectDB = require('./backend/config/db');
const userRoutes = require('./backend/routes/userRoutes');
const sessionRoutes = require('./backend/routes/sessionRoutes');
const workoutRoutes = require('./backend/routes/workoutRoutes');
const healthDataRoutes = require('./backend/routes/healthDataRoutes');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/health-data', healthDataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));