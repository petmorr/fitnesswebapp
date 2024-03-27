document.addEventListener('DOMContentLoaded', () => {
    fetchWorkoutPlans();
});

function fetchWorkoutPlans() {
    console.log('Fetching workout plans for user ID:');
    fetch(`/workout/api/workout-plan`, { credentials: 'include' })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.length > 0) {
            const container = document.getElementById('workoutContainer');
            container.innerHTML = ''; // Clear existing content
            data.data.forEach((workout, index) => {
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
    .catch(error => {
        console.error('Error fetching workout plans:', error);
        document.getElementById('workoutContainer').innerHTML = 'Error fetching workout plans.';
    });
}