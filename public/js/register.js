document.getElementById('registerForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const formData = new FormData(this);
  fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData)),
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // Registration successful, redirect or inform the user
      console.log('Registration successful');
    } else {
      // Handle errors
      console.error('Registration failed', data.error);
    }
  })
  .catch(error => console.error('Error:', error));
});