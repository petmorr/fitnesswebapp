const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.renderLandingPage = async (req, res) => {
  res.render('landing', { title: 'Welcome to FitnessPal' });
};

exports.renderRegisterPage = async (req, res) => {
  res.render('register', { title: 'Register for FitnessPal' });
};

// Helper function to generate JWT
const generateToken = async (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create a new user
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate a JWT token
    const token = generateToken(user._id);

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.renderLoginPage = async (req, res) => {
  res.render('login', { title: 'Login to FitnessPal' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Cannot find user, please re-enter a valid email has an account already.' });
    }

    // Compare the submitted password with the hashed password in the database
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    // Generate a JWT token
    const token = generateToken(user._id);

    res.status(201).json({ message: 'Login successful', token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.renderDashboardPage = async (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
};