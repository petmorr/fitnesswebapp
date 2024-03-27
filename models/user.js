const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address.']
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: [16, 'Minimum age is 16'],
    max: [100, 'Maximum age is 100']
  },
  weight: {
    type: Number,
    required: true,
    min: [20, 'Minimum weight is 20 kg'],
    max: [635, 'Maximum weight is 635 kg']
  },
  height: {
    type: Number,
    required: true,
    min: [91.44, 'Minimum height is 91.44 cm'], // 3 feet in cm
    max: [272, 'Maximum height is 272 cm'] // 9 feet in cm
  },
  fitnessLevel: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  fitnessGoal: [{
    type: String,
    required: true,
    enum: ['cardio', 'olympic_weightlifting', 'plyometrics', 'powerlifting', 'strength', 'stretching', 'strongman']
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(8); // Generate a salt
      this.password = await bcrypt.hash(this.password, salt); // Hash the password
      return next();
    } catch (error) {
      return next(error);
    }
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);