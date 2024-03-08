const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser);

// MongoDB connection -- LEAVE THIS TO ME (PETER)
//mongoose.connect('connection-string',  { useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// User model
const user = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, require: true, enum: ['user', 'personal_trainer', 'admin'] }
}));

// Routes
// Registration
app.post('/register', async (req, res) => {
    try {
      const { email, password, role } = req.body;
      if (!['user', 'personal_trainer', 'admin'].includes(role)) {
        return res.status(400).send('Invalid role specified');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, role });
      await user.save();
      res.status(201).send('User created');
    } catch (error) {
      res.status(500).send(error.message);
    }
});

// Login
// Login
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user && await bcrypt.compare(password, user.password)) {
        res.status(200).json({ message: 'Login successful', role: user.role });
      } else {
        res.status(400).send('Invalid credentials');
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
});
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  