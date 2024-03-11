const User = require('../models/user');
const jwt = require('jsonwebtoken');
const path = require('path');

exports.landingPage = async (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.create({ email, password });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user: { email: user.email }, token });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ user: { email: user.email }, token });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
};