document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/current_user', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const userId = data.userId;
            fetchWorkoutPreview(userId);
        })
        .catch(error => console.error('Error fetching user ID:', error));
});

function fetchWorkoutPreview(userId) {
    fetch(`/workout/workout-preview/${userId}`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                const workout = data.data[0]; // Assuming the first item is the preview
                document.getElementById('todayWorkoutPreview').innerHTML = `
                    <h2>Today's Workout: ${workout.name}</h2>
                    <p>${workout.instructions}</p>
                `;
            } else {
                document.getElementById('todayWorkoutPreview').innerHTML = 'No workouts planned for today.';
            }
        })
        .catch(error => console.error('Error fetching workout preview:', error));
}