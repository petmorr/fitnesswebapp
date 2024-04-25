// Fetches and displays workout preview data for the user's dashboard
function fetchWorkoutPreview() {
    fetch(`/workout/api/workout-preview`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                displayWorkoutPreview(data.data[0]); // Assume first item is the preview
            } else {
                document.getElementById('todayWorkoutPreview').innerHTML = 'No workouts planned for today.';
            }
        })
        .catch(error => console.error('Error fetching workout preview:', error));
}

function displayWorkoutPreview(workout) {
    const previewContainer = document.getElementById('todayWorkoutPreview');
    previewContainer.innerHTML = `
        <h2>Today's Workout: ${workout.name}</h2>
        <p>${workout.instructions}</p>
    `;
}