const axios = require('axios');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load permanent token from environment variable
const PERMANENT_TOKEN = process.env.PERMANENT_TOKEN;

// Function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Function to handle registration
exports.register = async (req, res) => {
  try {
    console.log("Registration request received.");
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      console.log("Email or password missing.");
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check if the user already exists
    console.log("Checking if the user already exists.");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with this email.");
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Create a new user
    console.log("Creating a new user.");
    const user = new User({
      email,
      password: await bcrypt.hash(password, 10), // Hash the password before saving
    });

    await user.save();

    // Authenticate with the external API using the permanent token
    console.log("Authenticating with the external API using the permanent token.");
    const apiResponse = await axios.get('https://wger.de/api/v2/workout/', {
      headers: {
        'Authorization': `Token ${PERMANENT_TOKEN}`
      }
    });

    // Generate a JWT token
    console.log("Generating JWT token.");
    const token = generateToken(user._id);

    // Store access token in user document
    console.log("Storing access token in user document.");
    user.tokens = { access: PERMANENT_TOKEN };
    await user.save();

    console.log("Registration successful.");
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to handle login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login request received.");
    // Validate email and password
    if (!email || !password) {
      console.log("Email or password missing.");
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user by email
    console.log("Finding user by email.");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found.");
      return res.status(401).json({ error: 'Cannot find user, please re-enter a valid email that has an account already.' });
    }

    // Compare the submitted password with the hashed password in the database
    console.log("Comparing passwords.");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid login credentials.");
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    // Generate a JWT token
    console.log("Generating JWT token.");
    const token = generateToken(user._id);

    // Store access token in user document
    console.log("Storing access token in user document.");
    user.tokens = { access: PERMANENT_TOKEN };
    await user.save();

    console.log("Login successful.");
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to render landing page
exports.renderLandingPage = (req, res) => {
  console.log("Rendering landing page.");
  res.render('landing', { title: 'Welcome to FitnessPal' });
};

// Function to render registration page
exports.renderRegisterPage = (req, res) => {
  console.log("Rendering registration page.");
  res.render('register', { title: 'Register for FitnessPal' });
};

// Function to render login page
exports.renderLoginPage = (req, res) => {
  console.log("Rendering login page.");
  res.render('login', { title: 'Login to FitnessPal' });
};

// Function to render dashboard page
exports.renderDashboardPage = async (req, res) => {
  try {
    console.log("Rendering dashboard page.");
    // Retrieve user ID from request
    const userId = req.userId;

    // Check if user ID is available
    if (!userId) {
      console.log("User ID not available.");
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the user by ID
    console.log("Finding user by ID.");
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found.");
      return res.status(404).json({ error: 'User not found' });
    }

    // Render the dashboard page
    res.render('dashboard', { title: 'Dashboard' });
  } catch (error) {
    console.error("Dashboard rendering error:", error);
    res.status(500).send('Internal Server Error');
  }
};
