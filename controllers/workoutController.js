const axios = require('axios');
const User = require('../models/user');
const cron = require('node-cron');

exports.generateWorkoutPage = (req, res) => {
    res.render('workoutPlan', { title: 'Your Workout Plan', });
};

async function fetchExercisesFromAPI(fitnessGoal, fitnessLevel) {
    const difficultyQuery = getDifficultyQuery(fitnessLevel);
    try {
        const response = await axios.get(`https://api.api-ninjas.com/v1/exercises?type=${fitnessGoal}${difficultyQuery}`, {
            headers: { 'X-Api-Key': process.env.API_NINJAS_KEY }
        });
        return mapExercises(response.data, fitnessLevel);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        throw error;
    }
}

function getDifficultyQuery(fitnessLevel) {
    switch(fitnessLevel) {
        case 'intermediate':
            return '&difficulty=beginner&difficulty=intermediate';
        case 'expert':
            return '&difficulty=beginner&difficulty=intermediate&difficulty=expert';
        default:
            return `&difficulty=${fitnessLevel}`;
    }
}

function mapExercises(data, fitnessLevel) {
    return data.map(exercise => {
        // Retrieve the appropriate exercise parameters based on muscle group and fitness level
        const { sets, reps, weight } = getExerciseParameters(exercise.muscle, fitnessLevel);

        return {
            name: exercise.name,
            muscle: exercise.muscle,
            // Use parameters to set values for sets, reps, and weight
            sets,
            reps,
            weight,
            feedback: 'neutral' // Default feedback
        };
    });
}

function getExerciseParameters(muscle, fitnessLevel) {
    const parameters = {
        beginner: {
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
            // Moderate weights for building muscle and strength
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

function adjustExercisesBasedOnFeedback(exercises, feedbackData) {
    return exercises.map(exercise => {
        const feedbackForExercise = feedbackData.find(fb => fb.name === exercise.name);
        let weightAdjustmentFactor = 1;

        if (feedbackForExercise) {
            switch (feedbackForExercise.feedback) {
                case 'positive':
                    weightAdjustmentFactor = 1.1;
                    break;
                case 'negative':
                    weightAdjustmentFactor = 0.9;
                    break;
                // 'neutral' or no feedback leads to no change
            }
        }

        return {
            ...exercise,
            weight: Math.round(exercise.weight * weightAdjustmentFactor),
        };
    });
}

function generateBalancedWeeklyWorkoutPlan(exercises, workoutDays) {
    const plan = {};
    workoutDays.forEach(day => plan[day] = []);

    // Group exercises by muscle to keep similar workouts together
    const exercisesByMuscle = exercises.reduce((acc, exercise) => {
        if (!acc[exercise.muscle]) acc[exercise.muscle] = [];
        acc[exercise.muscle].push(exercise);
        return acc;
    }, {});

    // Distribute exercises across workout days, attempting to balance the load
    Object.keys(exercisesByMuscle).forEach(muscle => {
        let index = 0;
        exercisesByMuscle[muscle].forEach(exercise => {
            const day = workoutDays[index % workoutDays.length];
            plan[day].push(exercise);
            index++;
        });
    });

    return Object.keys(plan).map(day => ({ day, exercises: plan[day] }));
}

exports.saveWorkoutDays = async (req, res) => {
    const { userId } = req.session;
    const { workoutDays } = req.body;
    
    try {
        await User.findByIdAndUpdate(userId, { workoutDays });
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving workout preferences:', error);
        res.status(500).json({ success: false, errorMessage: 'Failed to save workout preferences' });
    }
};

exports.generateAndUpdateWorkoutPlan = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found');

        const exercises = await fetchExercisesFromAPI(user.fitnessGoal, user.fitnessLevel);
        const adjustedExercises = adjustExercisesBasedOnFeedback(exercises, user.weeklyWorkoutPlanFeedback || []);
        const weeklyWorkoutPlan = generateBalancedWeeklyWorkoutPlan(adjustedExercises, user.workoutDays);

        user.weeklyWorkoutPlan = weeklyWorkoutPlan;
        await user.save();

        res.json({ success: true, message: 'Workout plan generated and updated successfully', weeklyWorkoutPlan });
    } catch (error) {
        console.error('Error in workout plan generation:', error);
        res.status(500).json({ success: false, errorMessage: 'Failed to generate or update workout plan' });
    }
};

exports.submitWorkoutFeedback = async (req, res) => {
    const { userId } = req.session;
    const feedbackData = req.body; // This should be an array of { day, name, feedback }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Process feedback for each submitted exercise
        feedbackData.forEach(feedbackItem => {
            const { day, name, feedback } = feedbackItem;
            // Find the corresponding day and exercise
            const dayPlan = user.weeklyWorkoutPlan.find(plan => plan.day === day);
            if (dayPlan) {
                const exercise = dayPlan.exercises.find(ex => ex.name === name);
                if (exercise) {
                    exercise.feedback = feedback;
                }
            }
        });

        await user.save();
        res.json({ success: true, message: 'Feedback submitted successfully' });

        // Consider triggering a workout plan update here if needed
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ success: false, errorMessage: 'Failed to submit feedback' });
    }
};

// Cron job to generate new workout plans for all users at the start of each week
cron.schedule('0 0 * * 1', async () => {
    console.log('Generating new workout plans for all users...');

    const users = await User.find({});
    users.forEach(async (user) => {
        const exercises = await fetchExercisesFromAPI(user.fitnessGoal, user.fitnessLevel);
        user.weeklyWorkoutPlan = generateBalancedWeeklyWorkoutPlan(exercises, user.workoutDays);
        await user.save();
    });
});