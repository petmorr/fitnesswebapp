const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkoutPlanSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercises: [{
    name: String,
    reps: Number,
    sets: Number,
    rest: Number,
    weight: Number
  }],
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);