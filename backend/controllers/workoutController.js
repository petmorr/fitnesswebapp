const WorkoutPlan = require('../models/workoutPlan'); // Ensure you have a WorkoutPlan model

exports.createWorkoutPlan = async (req, res) => {
  const { userId, exercises } = req.body;
  
  try {
    const newWorkoutPlan = new WorkoutPlan({
      userId,
      exercises
    });
    
    await newWorkoutPlan.save();
    res.json(newWorkoutPlan);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateWorkoutPlan = async (req, res) => {
  const { exercises } = req.body; // Assuming exercises is what you'd want to update
  
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    if (!workoutPlan) {
      return res.status(404).json({ msg: 'Workout Plan not found' });
    }

    // Update the exercises field
    workoutPlan.exercises = exercises;
    await workoutPlan.save();
    res.json(workoutPlan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
