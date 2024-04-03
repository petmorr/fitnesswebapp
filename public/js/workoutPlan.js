document.addEventListener('DOMContentLoaded', () => {
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    // Ensure this ID matches your button container in the HTML
    const generateWorkoutPlanBtn = document.getElementById('generateWorkoutPlanBtn');

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
                console.log('Workout days saved successfully.');
                // Directly show the generate workout plan button container
                generateWorkoutPlanBtn.style.display = 'block';
            } else {
                console.error('Failed to save workout days.');
                // Optionally, display an error message to the user
            }
        })
        .catch(error => {
            console.error('Error saving workout days:', error);
            // Optionally, display an error message to the user
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
    weeklyWorkoutPlan.forEach(dayPlan => {
        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<h3>${dayPlan.day}</h3>`;
        const exercisesList = document.createElement('ul');
        dayPlan.exercises.forEach((exercise, index) => {
            exercisesList.innerHTML += `
                <li>
                    ${index + 1}. ${exercise.name}: ${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight} kg
                    - Feedback: <select data-exercise-id="${exercise._id}">
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
}