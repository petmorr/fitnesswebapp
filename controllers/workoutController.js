const { generateWorkoutAdvice } = require('./services/openaiService'); 

exports.getAdvice = async (req, res) => {
  const { question } = req.body;
  try {
    const advice = await generateWorkoutAdvice(question);
    res.json({ advice });
  } catch (error) {
    console.error("Error in getting workout advice:", error);
    res.status(500).send("Error getting workout advice.");
  }
};