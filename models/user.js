const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'personalTrainer', 'admin'], default: 'user' },
  fitnessGoals: { type: String },
  preferences: {
    workout: [String],
    diet: [String],
  },
  progress: [{
    date: Date,
    metrics: {
      weight: Number,
      caloriesBurned: Number,
      caloriesConsumed: Number,
      workoutIntensity: Number,
    }
  }]
});

module.exports = mongoose.model('User', userSchema);