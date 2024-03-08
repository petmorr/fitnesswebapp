const mongoose = require('mongoose');
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

// Main User schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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
});

module.exports = mongoose.model('User', UserSchema);