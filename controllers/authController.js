const { convertWeight, convertHeight } = require('../utils/utils');
const logger = require('../utils/logger');
const User = require('../models/user');

// Render the landing page
exports.renderLandingPage = (req, res) => {
  logger.info('Rendering the landing page');
  return res.render('landing', { title: 'Welcome to FitnessPal' });
};

// Render the registration page
exports.renderRegisterPage = (req, res) => {
  logger.info('Rendering the registration page');
  return res.render('register', { title: 'Register for FitnessPal' });
};

// Handle user registration
exports.register = async (req, res) => {
  try {
    logger.debug('Starting user registration');
    const { email, password, confirmPassword, age, weight, weightUnit, height, heightUnit, fitnessLevel, fitnessGoal } = req.body;
    let missingFields = ['email', 'password', 'confirmPassword', 'age', 'weight', 'height', 'fitnessGoal', 'fitnessLevel'].filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      logger.warn('Missing fields during registration', { missingFields });
      return res.status(400).json({ success: false, errorMessage: `Missing fields: ${missingFields.join(', ')}.` });
    }

    if (password !== confirmPassword) {
      logger.warn('Password mismatch during registration', { email });
      return res.status(400).json({ success: false, errorMessage: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Attempt to register with an existing email', { email });
      return res.status(400).json({ success: false, errorMessage: 'User already exists.' });
    }

    let finalWeight = convertWeight(weight, weightUnit);
    if (finalWeight < 20 || finalWeight > 635) {
      return res.status(400).json({ success: false, errorMessage: 'Invalid weight.' });
    }

    let finalHeight = convertHeight(height, heightUnit);
    if (finalHeight < 91.44 || finalHeight > 272) {
      logger.warn('Invalid height specified', { finalHeight });
      return res.status(400).json({ success: false, errorMessage: 'Invalid height.' });
    }

    const user = new User({ email, password, age, weight: finalWeight, height: finalHeight, fitnessLevel, fitnessGoal });
    await user.save();
    logger.info('User registered successfully', { email });
    return res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    logger.error('Registration failed', { error });
    return res.status(500).json({ success: false, errorMessage: 'Internal server error' });
  }
};

// Render the login page
exports.renderLoginPage = (req, res) => {
  logger.info('Rendering the login page');
  return res.render('login', { title: 'Login to FitnessPal' });
};

// Handle user login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
      // Validate email and password
      if (!email || !password) {
        return res.status(400).json({ success: false, errorMessage: 'Email and password are required.' })
      }

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, errorMessage: 'Invalid email.' });
      }

      // Compare the submitted password with the hashed password in the database
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, errorMessage: 'Invalid password.' });
      }

      // Set the session variables
      req.session.userId = user._id;
      req.session.save(err => {
        if (err) {
          logger.error('Session save error', err);
          return res.status(500).json({ success: false, errorMessage: 'Internal server error' });
        }
        res.json({ success: true, message: "Login successful" });
      });
  } catch (error) {
      return res.status(500).json({ success: false, errorMessage: 'Internal server error' });
  }
};

// Render the dashboard page
exports.renderDashboardPage = (req, res) => {
  logger.info('Rendering the dashboard page');
  return res.render('dashboard', { title: 'Dashboard' });
};

// Retrieve current user session data
exports.currentUser = (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ success: true, userId: req.session.userId });
  } else {
    logger.warn('Attempt to access session data without authentication');
    return res.status(401).json({ success: false, errorMessage: 'User not authenticated' });
  }
};

// Handle user logout
exports.logout = (req, res) => {
  if (req.session) {
      req.session.destroy(err => {
          if (err) {
              logger.error('Session destruction error', err);
              return res.status(500).json({ success: false, errorMessage: 'Internal server error during logout' });
          }
          res.clearCookie('connect.sid', { path: '/' });
          res.redirect('/login');
      });
  } else {
      res.redirect('/login');
  }
};