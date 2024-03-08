const { generateWorkoutPlan } = require('./path/to/openaiService');

// Example usage within an Express route
app.post('/api/generate-workout-plan', async (req, res) => {
  try {
    const userData = req.body; 
    // Validate user data
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data');
    }
    if (!userData.fitnessGoals || !userData.fitnessLevel || !userData.preferences) {
      throw new Error('Missing required user data');
    }

    // Generate workout plan
    const structuredWorkoutPlan = await generateWorkoutPlan(userData);

    res.json(structuredWorkoutPlan);
    res.json(structuredWorkoutPlan);
  } catch (error) {
    console.error("Failed to generate workout plan:", error);
    res.status(500).send("Failed to generate workout plan.");
  }
});