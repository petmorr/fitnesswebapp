document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/current_user', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const userId = data.userId;
            fetchWorkoutPlans(userId);
        })
        .catch(error => console.error('Error fetching user ID:', error));
});

function fetchWorkoutPlans(userId) {
    console.log('Fetching workout plans for user ID:', userId);
    fetch(`/workout/workout-plans/${userId}`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                const container = document.getElementById('workoutContainer');
                data.data.forEach(workout => {
                    const element = document.createElement('div');
                    element.innerHTML = `
                        <h3>${workout.name}</h3>
                        <p>Type: ${workout.type}, Muscle: ${workout.muscle}</p>
                        <p>Instructions: ${workout.instructions}</p>
                    `;
                    container.appendChild(element);
                });
            } else {
                document.getElementById('workoutContainer').innerHTML = 'No workout plans found.';
            }
        })
        .catch(error => console.error('Error fetching workout plans:', error));
}