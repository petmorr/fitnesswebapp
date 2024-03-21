const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.renderLandingPage = (req, res) => {
  res.render('landing', { title: 'Welcome to FitnessPal' });
};

exports.renderRegisterPage = (req, res) => {
  res.render('register', { title: 'Register for FitnessPal' });
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
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.renderLoginPage = (req, res) => {
  res.render('login', { title: 'Login to FitnessPal' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
      // Validate email and password
      if (!email || !password) {
        return res.render('login', { title: 'Login to FitnessPal', errorMessage: 'Email and password are required.' })
      }

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.render('login', { title: 'Login to FitnessPal', errorMessage: 'Invalid email.' });
      }

      // Compare the submitted password with the hashed password in the database
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.render('login', { title: 'Login to FitnessPal', errorMessage: 'Invalid password,' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, sameSite: 'Strict', secure: true });
      return res.redirect('/dashboard');
  } catch (error) {
      console.error(error);
      return res.status(500).render('login', { title: 'Login to FitnessPal', errorMessage: 'Internal server error' });
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