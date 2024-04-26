const axios = require('axios');
const User = require('../models/user');
const cron = require('node-cron');
const logger = require('../utils/logger');

// Renders the workout plan page
exports.generateWorkoutPage = (req, res) => {
    logger.info('Rendering the workout plan page');
    res.render('workoutPlan', { title: 'Your Workout Plan' });
};

// Fetches exercises from an external API based on user's fitness goals and level
exports.fetchExercisesFromAPI = async (fitnessGoal, fitnessLevel) => {
    const difficultyQuery = getDifficultyQuery(fitnessLevel);
    const url = `https://api.api-ninjas.com/v1/exercises?type=${fitnessGoal}${difficultyQuery}`;
    try {
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
    return {
        'beginner': '&difficulty=beginner',
        'intermediate': '&difficulty=beginner&difficulty=intermediate',
        'expert': '&difficulty=beginner&difficulty=intermediate&difficulty=expert'
    }[fitnessLevel] || '';
}

// Maps and adjusts exercise data received from the API
function mapExercises(data, fitnessLevel) {
    logger.debug('Mapping exercises based on data received from API');
    return data.map(exercise => ({
        ...exercise,
        ...getExerciseParameters(exercise.muscle, fitnessLevel),
        feedback: 'neutral' // Default feedback value
    }));
}

// Retrieves specific exercise parameters based on muscle group and fitness level
function getExerciseParameters(muscle, fitnessLevel) {
    const parameters = {
        beginner: {
            // Light weights for muscle endurance
            abdominals: { sets: 3, reps: 15, weight: 5 },
            abductors: { sets: 2, reps: 15, weight: 5 },
            adductors: { sets: 2, reps: 15, weight: 5 },
            biceps: { sets: 2, reps: 15, weight: 5 },
            calves: { sets: 2, reps: 20, weight: 5 },
            chest: { sets: 2, reps: 12, weight: 10 },
            forearms: { sets: 2, reps: 15, weight: 5 },
            glutes: { sets: 2, reps: 15, weight: 5 },
            hamstrings: { sets: 2, reps: 15, weight: 5 },
            lats: { sets: 2, reps: 12, weight: 10 },
            lower_back: { sets: 2, reps: 15, weight: 5 },
            middle_back: { sets: 2, reps: 12, weight: 10 },
            neck: { sets: 2, reps: 15, weight: 5 },
            quadriceps: { sets: 2, reps: 15, weight: 5 },
            traps: { sets: 2, reps: 15, weight: 5 },
            triceps: { sets: 2, reps: 15, weight: 5 },
        },
        intermediate: {
            // Moderate weights for muscle endurance and strength
            abdominals: { sets: 4, reps: 20, weight: 10 },
            abductors: { sets: 3, reps: 12, weight: 10 },
            adductors: { sets: 3, reps: 12, weight: 10 },
            biceps: { sets: 3, reps: 10, weight: 10 },
            calves: { sets: 4, reps: 15, weight: 10 },
            chest: { sets: 3, reps: 8, weight: 20 },
            forearms: { sets: 3, reps: 12, weight: 5 },
            glutes: { sets: 3, reps: 10, weight: 15 },
            hamstrings: { sets: 3, reps: 10, weight: 15 },
            lats: { sets: 3, reps: 8, weight: 20 },
            lower_back: { sets: 3, reps: 10, weight: 10 },
            middle_back: { sets: 3, reps: 8, weight: 20 },
            neck: { sets: 3, reps: 20, weight: 10 },
            quadriceps: { sets: 3, reps: 10, weight: 15 },
            traps: { sets: 3, reps: 10, weight: 10 },
            triceps: { sets: 3, reps: 10, weight: 10 },
        },
        expert: {
            // Heavy weights for maximum strength and muscle gain
            abdominals: { sets: 5, reps: 25, weight: 15 },
            abductors: { sets: 4, reps: 8, weight: 15 },
            adductors: { sets: 4, reps: 8, weight: 15 },
            biceps: { sets: 4, reps: 6, weight: 15 },
            calves: { sets: 5, reps: 12, weight: 15 },
            chest: { sets: 4, reps: 6, weight: 30 },
            forearms: { sets: 4, reps: 8, weight: 10 },
            glutes: { sets: 4, reps: 8, weight: 20 },
            hamstrings: { sets: 4, reps: 8, weight: 20 },
            lats: { sets: 4, reps: 6, weight: 30 },
            lower_back: { sets: 4, reps: 8, weight: 15 },
            middle_back: { sets: 4, reps: 6, weight: 30 },
            neck: { sets: 4, reps: 25, weight: 15 },
            quadriceps: { sets: 4, reps: 8, weight: 20 },
            traps: { sets: 4, reps: 8, weight: 15 },
            triceps: { sets: 4, reps: 6, weight: 15 },
        }
    };

    return parameters[fitnessLevel][muscle];
}

// Adjusts exercises based on user feedback data
function adjustExercisesBasedOnFeedback(exercises, feedbackData) {
    return exercises.map(exercise => {
        const feedback = feedbackData.find(fb => fb.name === exercise.name) || {};
        const adjustmentFactor = feedback.feedback === 'positive' ? 1.1 : feedback.feedback === 'negative' ? 0.9 : 1;
        return {
            ...exercise,
            weight: Math.round(exercise.weight * adjustmentFactor)
        };
    });
}

// Generates a balanced weekly workout plan
function generateBalancedWeeklyWorkoutPlan(exercises, workoutDays) {
    const plan = {};
    workoutDays.forEach(day => plan[day] = []);

    exercises.forEach(exercise => {
        workoutDays.forEach(day => {
            plan[day].push({ ...exercise, day });
        });
    });

    return Object.keys(plan).map(day => ({ day, exercises: plan[day] }));
}

// Saves specified workout days for a user and generates a new workout plan
exports.saveWorkoutDays = async (req, res) => {
    const { userId } = req.session;
    const { workoutDays } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { workoutDays }, { runValidators: true });
        
        // Using axios to make a GET request to the route
        const response = await axios.get('http://localhost:3000/api/workout-plan', {
            headers: { Authorization: `Bearer ${yourTokenHere}` }
        });
        
        if (response.data.success) {
            await User.findByIdAndUpdate(userId, { weeklyWorkoutPlan: response.data.weeklyWorkoutPlan }, { runValidators: true });
            res.json({ success: true, weeklyWorkoutPlan: response.data.weeklyWorkoutPlan });
        } else {
            res.status(404).json(response.data);
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, errorMessage: 'Failed to save workout preferences and generate plan' });
        }
    }
}

// Generates and updates a workout plan based on user feedback and saved preferences
exports.generateAndUpdateWorkoutPlan = async (req, res) => {
    const userId = req.session.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('User not found', { userId });
            return res.status(404).json({ success: false, errorMessage: 'User not found' });
        }

        // Check if user already has a plan and if it's up-to-date
        if (user.weeklyWorkoutPlan && user.weeklyWorkoutPlan.length > 0) {
            return res.json({ success: true, weeklyWorkoutPlan: user.weeklyWorkoutPlan });
        }

        const exercises = await this.fetchExercisesFromAPI(user.fitnessGoal, user.fitnessLevel);
        const adjustedExercises = adjustExercisesBasedOnFeedback(exercises, user.weeklyWorkoutPlanFeedback || []);
        user.weeklyWorkoutPlan = generateBalancedWeeklyWorkoutPlan(adjustedExercises, user.workoutDays);
        await user.save();

        return res.json({ success: true, message: 'Workout plan generated and updated successfully', weeklyWorkoutPlan: user.weeklyWorkoutPlan });
    } catch (error) {
        console.log
        logger.error('Error in workout plan generation', { userId, error });
        res.status(500).json({ success: false, errorMessage: 'Failed to generate or update workout plan' });
    }
};

// Submits user feedback on workouts and adjusts workout plan accordingly
exports.submitWorkoutFeedback = async (req, res) => {
    const { userId } = req.session;
    const feedbackData = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('User not found when submitting feedback', { userId });
            return res.status(404).json({ success: false, errorMessage: 'User not found' });
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

// Processes the feedback for each workout
function processFeedback(user, feedbackData) {
    feedbackData.forEach(({ day, name, feedback }) => {
        const dayPlan = user.weeklyWorkoutPlan.find(plan => plan.day === day);
        const exercise = dayPlan.exercises.find(ex => ex.name === name);
        if (exercise) {
            exercise.feedback = feedback;
        }
    });
}

// Schedules a cron job to update workout plans weekly
cron.schedule('0 0 * * 1', async () => {
    logger.info('Generating new workout plans for all users');
    const users = await User.find({});
    users.forEach(async (user) => {
        const exercises = await this.fetchExercisesFromAPI(user.fitnessGoal, user.fitnessLevel);
        user.weeklyWorkoutPlan = generateBalancedWeeklyWorkoutPlan(exercises, user.workoutDays);
        await user.save();
    });
});