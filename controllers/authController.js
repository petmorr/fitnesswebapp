const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.renderLandingPage = async (req, res) => {
  res.render('landing', { title: 'Welcome to FitnessPal' });
};

exports.renderRegisterPage = (req, res) => {
  res.render('register', { title: 'Register for FitnessPal' });
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({ user: { email: user.email }, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.renderLoginPage = (req, res) => {
  res.render('login', { title: 'Login to FitnessPal' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Login failed. Check authentication credentials.' });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Login failed. Check authentication credentials.' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({ user: { email: user.email }, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};