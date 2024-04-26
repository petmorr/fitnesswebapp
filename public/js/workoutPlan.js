document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkForExistingPlan();
});

function setupEventListeners() {
    const saveBtn = document.getElementById('savePreferencesBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveWorkoutPreferences);
    } else {
        console.warn('Save Preferences button not available.');
    }

    const customiseBtn = document.getElementById('customiseWorkoutBtn');
    if (customiseBtn) {
        customiseBtn.addEventListener('click', showWorkoutDaysForm);
    } else {
        console.warn('Customise Workout button not available.');
    }
}

function showWorkoutDaysForm() {
    toggleVisibility('weeklyWorkoutPlan', 'none');
    toggleVisibility('workoutDaysFormSection', 'block');
    attachEventListenersToForm();
}

function attachEventListenersToForm() {
    const saveBtn = document.getElementById('savePreferencesBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveWorkoutPreferences);
    } else {
        console.error('Failed to attach event listener: Save Preferences button not found.');
    }
}

function checkForExistingPlan() {
    fetch('/workout/api/workout-plan', { credentials: 'include' })
        .then(handleResponse)
        .then(handlePlanData)
        .catch(handleFetchError);
}

function handlePlanData(data) {
    if (data.success && data.weeklyWorkoutPlan && data.weeklyWorkoutPlan.length > 0) {
        displayWorkoutPlan(data.weeklyWorkoutPlan);
        toggleVisibility('weeklyWorkoutPlan', 'block');
        toggleVisibility('workoutDaysFormSection', 'none');
    } else {
        toggleVisibility('weeklyWorkoutPlan', 'none');
        toggleVisibility('workoutDaysFormSection', 'block');
    }
}

function saveWorkoutPreferences(event) {
    event.preventDefault();
    const selectedDays = collectCheckedDays('input[name="workoutDays"]:checked');
    console.log('Selected days:', selectedDays); // Debug: Check what days are being collected
    postWorkoutDays(selectedDays);
}

function collectCheckedDays(selector) {
    return [...document.querySelectorAll(selector)].map(input => input.value);
}

function postWorkoutDays(selectedDays) {
    fetch('/workout/api/saveWorkoutDays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutDays: selectedDays }),
        credentials: 'include'
    })
    .then(handleResponse)
    .then(() => {
        console.log('Fetching new workout plan after updating days');
        fetchWorkoutPlan(); // Ensure this is called to update the plan
    })
    .catch(error => console.error('Error saving workout days:', error));
}

function fetchWorkoutPlan() {
    fetch('/workout/api/workout-plan', { credentials: 'include' })
        .then(handleResponse)
        .then(handlePlanData)
        .catch(error => {
            console.error('Error fetching workout plan:', error);
            document.getElementById('weeklyWorkoutPlan').innerHTML = 'Error fetching workout plan.';
        });
}

function handleResponse(response) {
    if (!response.ok) {
        updateErrorMessage('Failed to load data: ' + response.statusText);
        throw new Error('Network response was not ok');
    }
    return response.json();
}

function displayWorkoutPlan(weeklyWorkoutPlan) {
    const container = document.getElementById('weeklyWorkoutPlan');
    if (container) {
        container.innerHTML = weeklyWorkoutPlan.map(dayPlan => createWorkoutCard(dayPlan)).join('');
        console.log('Workout plan updated:', weeklyWorkoutPlan); // Debug: Log updated plan
        addExerciseEventListeners();
    } else {
        console.error('Failed to find workout plan container.');
    }
}

function createWorkoutCard(dayPlan) {
    return `
        <div class="card">
            <h3>${dayPlan.day}</h3>
            <ul>${dayPlan.exercises.map(createExerciseItem).join('')}</ul>
        </div>
    `;
}

function createExerciseItem(exercise) {
    return `
        <li class="card-item">
            ${exercise.name}: ${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight} kg
            <input type="checkbox" class="exercise-completed">
            <select class="exercise-feedback">
                <option value="neutral">Neutral</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
            </select>
        </li>
    `;
}

function toggleVisibility(elementId, displayStyle) {
    const element = document.getElementById(elementId);
    if (element) {
        console.log(`Toggling visibility of ${elementId} to ${displayStyle}`);
        element.style.display = displayStyle;
    } else {
        console.error(`Failed to find element: ${elementId}`);
    }
}

function handleFetchError(error) {
    console.error('Error checking for existing plan:', error);
    toggleVisibility('workoutDaysFormSection', 'block');
}

function updateErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.innerText = message;
    }
}

function addExerciseEventListeners() {
    const checkboxes = document.querySelectorAll('.exercise-completed');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleExerciseCompletion);
    });
}

function handleExerciseCompletion(event) {
    const checkbox = event.target;
    if (checkbox.checked) {
        console.log("Exercise completed:", checkbox.parentElement.textContent);
    }
}

function submitFeedbackAutomatically() {
    const feedbackData = collectFeedbackData();
    console.log('Submitting feedback:', JSON.stringify(feedbackData));
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
        const checkbox = select.previousElementSibling.previousElementSibling;
        const exerciseName = select.parentElement.textContent.trim().split(':')[0];
        return {
            name: exerciseName,
            completed: checkbox.checked,
            feedback: select.value
        };
    });
}