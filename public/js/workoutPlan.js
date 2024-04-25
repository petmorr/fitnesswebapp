// Manages interactions on the workout plan page such as saving preferences and fetching workout plans
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('savePreferencesBtn').addEventListener('click', saveWorkoutPreferences);
    document.getElementById('generateWorkoutPlanBtn').addEventListener('click', fetchWorkoutPlan);
});

function saveWorkoutPreferences(event) {
    event.preventDefault();
    const selectedDays = [...document.querySelectorAll('input[name="workoutDays"]:checked')].map(input => input.value);
    fetch('/workout/api/saveWorkoutDays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutDays: selectedDays }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('generateWorkoutPlanBtn').style.display = 'block';
        } else {
            console.error('Failed to save workout days.');
        }
    })
    .catch(error => console.error('Error saving workout days:', error));
}

function fetchWorkoutPlan() {
    fetch('/workout/api/workout-plan', { credentials: 'include' })
        .then(handleResponse)
        .then(data => {
            if (data.success) {
                if (data.weeklyWorkoutPlan && data.weeklyWorkoutPlan.length > 0) {
                    displayWorkoutPlan(data.weeklyWorkoutPlan);
                } else {
                    document.getElementById('weeklyWorkoutPlan').innerHTML = 'No workout plans found.';
                }
            } else {
                throw new Error(data.errorMessage || 'Failed to fetch workout plan.');
            }
        })
        .catch(error => {
            console.error('Error fetching workout plan:', error);
            document.getElementById('weeklyWorkoutPlan').innerHTML = error.message;
        });
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

function displayWorkoutPlan(weeklyWorkoutPlan) {
    const container = document.getElementById('weeklyWorkoutPlan');
    container.innerHTML = weeklyWorkoutPlan.map(dayPlan => `
        <div>
            <h3>${dayPlan.day}</h3>
            <ul>
                ${dayPlan.exercises.map(exercise => `
                    <li>
                        ${exercise.name}: ${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight} kg
                        <input type="checkbox" class="exercise-completed">
                        <select class="exercise-feedback">
                            <option value="neutral">Neutral</option>
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                        </select>
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');
    addExerciseEventListeners();
}

function addExerciseEventListeners() {
    document.querySelectorAll('.exercise-completed').forEach(checkbox => {
        checkbox.addEventListener('change', handleExerciseCompletion);
    });
}

function handleExerciseCompletion(event) {
    const allCompleted = [...document.querySelectorAll('.exercise-completed')].every(checkbox => checkbox.checked);
    if (allCompleted) {
        submitFeedbackAutomatically();
    }
}

function submitFeedbackAutomatically() {
    const feedbackData = collectFeedbackData();
    console.log('Submitting feedback:', JSON.stringify(feedbackData)); // Ensure this logs actual data
    fetch('/workout/api/submitFeedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Feedback submission failed:', data.errorMessage);
            throw new Error(data.errorMessage || 'Unknown error during feedback submission');
        }
        console.log("Feedback submitted successfully, response:", data);
        fetchWorkoutPlan(); // Refresh the plan
    })
    .catch(error => console.error('Error submitting feedback:', error));
}

function collectFeedbackData() {
    return [...document.querySelectorAll('.exercise-feedback')].map(select => {
        const checkbox = select.previousElementSibling;
        const exerciseName = select.parentElement.textContent.split(':')[0].trim();
        return {
            name: exerciseName,
            completed: checkbox.checked,
            feedback: select.value
        };
    });
}