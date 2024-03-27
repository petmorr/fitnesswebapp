// document.addEventListener('DOMContentLoaded', () => {
//     fetch('/api/current_user', { credentials: 'include' })
//         .then(response => response.json())
//         .then(data => {
//             const userId = data.userId;
//             fetchWorkoutPlans(userId);
//         })
//         .catch(error => console.error('Error fetching user ID:', error));
// });

function fetchWorkoutPlans() {
    console.log('Fetching workout plans for user ID:');
    fetch(`/workout/api/workout-plan`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                const container = document.getElementById('workoutContainer');
                container.innerHTML = ''; // Clear existing content
                data.data.forEach(workout => {
                    const element = document.createElement('div');
                    element.innerHTML = `
                        <h3>${index + 1}. ${workout.name}</h3>
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