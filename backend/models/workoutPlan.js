const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  reps: { type: Number, required: true, min: 1 },
  sets: { type: Number, required: true, min: 1 },
  rest: { type: Number, required: true, min: 0 }, // rest in seconds
  weight: { type: Number, min: 0 }
}, { _id: false }); 

const WorkoutPlanSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercises: [ExerciseSchema],
  createdDate: {
    type: Date,
    default: () => Date.now()
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);