document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const formData = new FormData(this);
  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData)),
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem('token', data.token); // Store the token
      window.location.href = '/loginSuccess'; // Redirect to the login success page
    } else {
      // Handle errors, update UI accordingly
      const errorElement = document.getElementById('errorMessage');
      errorElement.textContent = data.error;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('errorMessage').textContent = error.message; // Display error
  });
});