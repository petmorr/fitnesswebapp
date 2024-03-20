const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.renderLandingPage = (req, res) => {
  res.render('landing', { title: 'Welcome to FitnessPal' });
};

exports.renderRegisterPage = (req, res) => {
  res.render('register', { title: 'Register for FitnessPal' });
};

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.register = async (req, res) => {
  try {
      const { email, password } = req.body;
      if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({ email, password: password });
      await user.save();

      const token = generateToken(user._id);
      res.status(201).json({ token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.renderLoginPage = (req, res) => {
  res.render('login', { title: 'Login to FitnessPal' });
};

exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password, user.password))) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);
      res.json({ token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.renderDashboardPage = (req, res) => {
  try {
    res.render('dashboard', { title: 'Dashboard' });
  } catch (error) {
    console.error("Dashboard rendering error:", error);
    res.status(500).send('Internal Server Error');
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};