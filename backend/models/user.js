const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Subdocument schema for user's progress metrics
const ProgressMetricsSchema = new Schema({
  date: Date,
  weight: Number,
  caloriesBurned: Number,
  caloriesConsumed: Number,
  workoutIntensity: Number,
}, { _id: false });

// Subdocument schema for user's leaderboard metrics
const LeaderboardSchema = new Schema({
  daily: Number,
  weekly: Number,
  monthly: Number,
}, { _id: false });

// Subdocument schema for user's achievements
const AchievementSchema = new Schema({
  name: String,
  achievedOn: Date,
  points: Number,
});

// Subdocument schema for user's motivational content
const MotivationalContentSchema = new Schema({
  images: [String], // Array of URLs to motivational images
  quotes: [String], // Array of motivational quotes
}, { _id: false });

// Email regex for validation
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Main User schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: emailRegex },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'personalTrainer', 'admin'], default: 'user' },
  fitnessGoals: { 
    type: String, 
    required: true,
  },
  preferences: {
    workout: [String], // User's workout preferences
    diet: [String], // User's diet preferences
  },
  progress: [ProgressMetricsSchema],
  leaderboards: LeaderboardSchema,
  points: { type: Number, default: 0 },
  achievements: [AchievementSchema],
  motivationalContent: MotivationalContentSchema,
  feedback: [{
    strength: String,
    weakness: String,
    notes: String,
  }],
}, { timestamps: true });

// Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to exclude sensitive data from the response
UserSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);