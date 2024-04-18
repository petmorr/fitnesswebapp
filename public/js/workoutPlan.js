document.addEventListener('DOMContentLoaded', () => {
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    const generateWorkoutPlanBtn = document.getElementById('generateWorkoutPlanBtn');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');

    savePreferencesBtn.addEventListener('click', function(e) {
        e.preventDefault();
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
                // Directly show the generate workout plan button container
                generateWorkoutPlanBtn.style.display = 'block';
            } else {
                console.error('Failed to save workout days.');
            }
        })
        .catch(error => {
            console.error('Error saving workout days:', error);
        });
    });

    generateWorkoutPlanBtn.addEventListener('click', fetchWorkoutPlan);
});
  
function fetchWorkoutPlan() {
    fetch('/workout/api/workout-plan', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.weeklyWorkoutPlan.length > 0) {
                displayWorkoutPlan(data.weeklyWorkoutPlan);
            } else {
                document.getElementById('weeklyWorkoutPlan').innerHTML = 'No workout plans found.';
            }
        })
        .catch(error => console.error('Error fetching workout plan:', error));
}

function displayWorkoutPlan(weeklyWorkoutPlan) {
    const container = document.getElementById('weeklyWorkoutPlan');
    container.innerHTML = ''; // Clear existing content

    weeklyWorkoutPlan.forEach((dayPlan, dayIndex) => { // Add dayIndex here
        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<h3>${dayPlan.day}</h3>`;
        const exercisesList = document.createElement('ul');

        dayPlan.exercises.forEach((exercise, exerciseIndex) => { // Add exerciseIndex here
            exercisesList.innerHTML += `
                <li>
                    ${exercise.name}: ${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight} kg
                    - Completed: <input type="checkbox" class="exercise-completed" data-day-index="${dayIndex}" data-exercise-index="${exerciseIndex}">
                    - Feedback: <select class="exercise-feedback" data-day-index="${dayIndex}" data-exercise-index="${exerciseIndex}">
                        <option value="neutral">Neutral</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                    </select>
                </li>
            `;
        });
        dayDiv.appendChild(exercisesList);
        container.appendChild(dayDiv);
    });

    // Ensure event listeners are properly added after updating the list
    addExerciseEventListeners();
}

function addExerciseEventListeners() {
    document.querySelectorAll('.exercise-completed').forEach(checkbox => {
        checkbox.addEventListener('change', handleExerciseCompletion);
    });
}

function handleExerciseCompletion(event) {
    const completedCheckboxes = document.querySelectorAll('.exercise-completed');
    const allCompleted = [...completedCheckboxes].every(checkbox => checkbox.checked);

    if (allCompleted) {
        submitFeedbackAutomatically();
    }
}

function submitFeedbackAutomatically() {
    const feedbackData = [...document.querySelectorAll('.exercise-feedback')].map((select, index) => {
        const checkbox = document.querySelectorAll('.exercise-completed')[index];
        return {
            dayIndex: checkbox.dataset.dayIndex,
            exerciseIndex: checkbox.dataset.exerciseIndex,
            completed: checkbox.checked,
            feedback: select.value
        };
    });

    fetch('/workout/api/submitFeedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchWorkoutPlan(); // Refresh the page to show new workout plan
        } else {
            console.error('Feedback submission failed');
        }
    })
    .catch(error => console.error('Error submitting feedback:', error));
}