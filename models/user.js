const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define schema for individual exercises within a workout day
const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscle: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  feedback: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' }
}, {
  timestamps: true
});

// Define schema for workout days, embedding the exercise schema
const workoutDaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  exercises: [exerciseSchema]
}, {
  timestamps: true
});

// Main schema definition for User
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address.']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [16, 'Minimum age is 16'],
    max: [100, 'Maximum age is 100']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [20, 'Minimum weight is 20 kg'],
    max: [635, 'Maximum weight is 635 kg']
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
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
  }],
  weeklyWorkoutPlan: [workoutDaySchema],
  workoutDays: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: []
  }
}, {
  timestamps: true
});

// Middleware to hash password before saving to database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare a candidate password with the user's hashed password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);