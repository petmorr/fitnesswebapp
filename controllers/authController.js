const User = require('../models/user');

exports.renderLandingPage = (req, res) => {
  res.render('landing', { title: 'Welcome to FitnessPal' });
};

exports.renderRegisterPage = (req, res) => {
  res.render('register', { title: 'Register for FitnessPal' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, confirmPassword, age, weight, weightUnit, height, heightUnit, fitnessLevel, fitnessGoals } = req.body;

    // Initialize an array to hold the names of missing fields
    let missingFields = [];
    
    // Check each field and add its name to the array if it's missing
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!confirmPassword) missingFields.push("confirmPassword");
    if (!age) missingFields.push("age");
    if (!weight) missingFields.push("weight");
    if (!height) missingFields.push("height");
    if (!fitnessGoals || fitnessGoals.length === 0) missingFields.push("fitnessGoals");
    if (!fitnessLevel) missingFields.push("fitnessLevel");

    // If there are any missing fields, return a message specifying which ones
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, errorMessage: `The following fields are missing or empty: ${missingFields.join(', ')}.` });
    }

    // Confirm password check
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, errorMessage: 'Passwords do not match.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, errorMessage: 'User already exists.' });
    }

    // Convert weight to kilograms
    let finalWeight = parseFloat(weight);
    if (weightUnit === 'lbs') {
      finalWeight = weight * 0.453592;
    } else if (weightUnit === 'stone') {
      finalWeight = weight * 6.35029;
    }

    // Check if weight is within the valid range
    if(finalWeight < 20 || finalWeight > 635) {
      return res.status(400).json({ success: false, errorMessage: 'Invalid weight, must be between 20kg and 635kg' });
    }

    // Convert height to centimeters
    let finalHeight = parseFloat(height);
    if (heightUnit === 'ftin') {
      const [feet, inches] = height.toString().split('.').map(part => parseFloat(part));
      finalHeight = feet * 30.48 + inches * 2.54;
    }

    // Check if height is within the valid range
    if(finalHeight < 91.44 || finalHeight > 272) {
      return res.status(400).json({ success: false, errorMessage: 'Invalid height, must be between 91.44cm and 272cm' });
    }

    // Create and save the user
    const user = new User({
      email,
      password,
      age,
      weight: finalWeight,
      height: finalHeight,
      fitnessLevel,
      fitnessGoals
    });

    // Save the user to the database
    await user.save();

    // Send a success response
    res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: 'Internal server error' });
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
      req.session.isAuthenticated = true;

      // Send a success response
      res.json({ success: true, message: "Login successful" });
  } catch (error) {
      return res.status(500).json({ success: false, errorMessage: 'Internal server error' });
  }
};

exports.renderDashboardPage = (req, res) => {
  try {
    res.render('dashboard', { title: 'Dashboard' });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/login');
  });
};