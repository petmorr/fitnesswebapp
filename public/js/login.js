document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const formData = new FormData(this);
  fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData)),
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // Login successful, redirect or inform the user
      console.log('Login successful');
    } else {
      // Handle errors
      console.error('Login failed', data.error);
    }
  })
  .catch(error => console.error('Error:', error));
});