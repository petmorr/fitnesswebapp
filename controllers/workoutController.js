const axios = require('axios');
const User = require('../models/user');
const cron = require('node-cron');
const logger = require('../utils/logger');

// Render workout plan page
exports.generateWorkoutPage = (req, res) => {
    logger.info('Rendering the workout plan page');
    res.render('workoutPlan', { title: 'Your Workout Plan' });
};

// Fetch exercises from external API based on user's fitness goals and level
exports.fetchExercisesFromAPI = async (fitnessGoal, fitnessLevel) => {
    const difficultyQuery = getDifficultyQuery(fitnessLevel);
    try {
        const url = `https://api.api-ninjas.com/v1/exercises?type=${fitnessGoal}${difficultyQuery}`;
        const response = await axios.get(url, {
            headers: { 'X-Api-Key': process.env.API_NINJAS_KEY }
        });
        return mapExercises(response.data, fitnessLevel);
    } catch (error) {
        logger.error('Error fetching exercises', { error });
        throw new Error('Failed to fetch exercises from API');
    }
};

// Helper to construct difficulty query based on fitness level
function getDifficultyQuery(fitnessLevel) {
    const difficultyMap = {
        intermediate: '&difficulty=beginner&difficulty=intermediate',
        expert: '&difficulty=beginner&difficulty=intermediate&difficulty=expert'
    };
    return difficultyMap[fitnessLevel] || `&difficulty=${fitnessLevel}`;
}

// Map and adjust exercise data received from the API
function mapExercises(data, fitnessLevel) {
    logger.debug('Mapping exercises based on data received from API');
    return data.map(exercise => {
        const exerciseParams = getExerciseParameters(exercise.muscle, fitnessLevel);
        return {
            ...exercise,
            ...exerciseParams,
            feedback: 'neutral'
        };
    });
}

// Get specific exercise parameters based on muscle group and fitness level
function getExerciseParameters(muscle, fitnessLevel) {
    const defaultParams = { sets: 2, reps: 15, weight: 10 };
    const params = {
        beginner: { ...defaultParams, weight: 5 },
        intermediate: { ...defaultParams, sets: 3, weight: 15 },
        expert: { ...defaultParams, sets: 4, weight: 20 }
    };
    return params[fitnessLevel] || defaultParams;
}

// Save specified workout days for a user
exports.saveWorkoutDays = async (req, res) => {
    const { userId } = req.session;
    const { workoutDays } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { workoutDays });
        logger.info('Workout days saved successfully', { userId });
        res.json({ success: true });
    } catch (error) {
        logger.error('Error saving workout preferences', { userId, error });
        res.status(500).json({ success: false, errorMessage: 'Failed to save workout preferences' });
    }
};

// Generate and update a workout plan based on user feedback and saved preferences
exports.generateAndUpdateWorkoutPlan = async (req, res) => {
    const userId = req.session.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('User not found', { userId });
            res.status(404).json({ success: false, errorMessage: 'User not found' });
            return;
        }

        const exercises = await fetchExercisesFromAPI(user.fitnessGoal, user.fitnessLevel);
        const adjustedExercises = adjustExercisesBasedOnFeedback(exercises, user.weeklyWorkoutPlanFeedback || []);
        user.weeklyWorkoutPlan = generateBalancedWeeklyWorkoutPlan(adjustedExercises, user.workoutDays);

        await user.save();
        logger.info('Workout plan generated and updated successfully', { userId });
        res.json({ success: true, message: 'Workout plan generated and updated successfully', weeklyWorkoutPlan: user.weeklyWorkoutPlan });
    } catch (error) {
        logger.error('Error in workout plan generation', { userId, error });
        res.status(500).json({ success: false, errorMessage: 'Failed to generate or update workout plan' });
    }
};

// Submit user feedback on workouts and adjust workout plan accordingly
exports.submitWorkoutFeedback = async (req, res) => {
    const { userId } = req.session;
    const feedbackData = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('User not found when submitting feedback', { userId });
            return res.status(404).send('User not found');
        }

        processFeedback(user, feedbackData);
        await user.save();
        logger.info('Feedback submitted successfully', { userId });
        res.json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        logger.error('Error submitting feedback', { userId, error });
        res.status(500).json({ success: false, errorMessage: 'Failed to submit feedback' });
    }
};

// Process the feedback for each workout
function processFeedback(user, feedbackData) {
    feedbackData.forEach(({ day, name, feedback }) => {
        const dayPlan = user.weeklyWorkoutPlan.find(plan => plan.day === day);
        const exercise = dayPlan.exercises.find(ex => ex.name === name);
        if (exercise) {
            exercise.feedback = feedback;
        }
    });
}

// Schedule a cron job to update workout plans weekly
cron.schedule('0 0 * * 1', async () => {
    logger.info('Generating new workout plans for all users');
    const users = await User.find({});
    users.forEach(async (user) => {
        const exercises = await fetchExercisesFromAPI(user.fitnessGoal, user.fitnessLevel);
        user.weeklyWorkoutPlan = generateBalancedWeeklyWorkoutPlan(exercises, user.workoutDays);
        await user.save();
    });
});