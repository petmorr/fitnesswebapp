const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'personalTrainer', 'admin'] },
  // Add additional fields for profile information
});

module.exports = mongoose.model('User', userSchema);