const axios = require('axios');
const User = require('../models/user');

exports.generateWorkoutPage = (req, res) => {
    res.render('workoutPlan', { title: 'Your Workout Plan' });
}

exports.workoutPlan = async (req, res) => {
    const userId = req.session.userId; 
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send('User not found');
    }

    const type = user.fitnessGoal;
    const fitnessLevel = user.fitnessLevel;

    axios.get(`https://api.api-ninjas.com/v1/exercises?type=${type}&difficulty=${fitnessLevel}`, {
        headers: { 'X-Api-Key': process.env.API_NINJAS_KEY }
    })
    .then(response => {
        res.json({ success: true, data: response.data });
    })
    .catch(error => {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ success: false, errorMessage: 'Failed to fetch workout plan' });
    });
};