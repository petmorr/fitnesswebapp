document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
  
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
        if (response.ok) {
          // Assuming the server responds with a JSON object containing a token
          localStorage.setItem('token', data.token); // Store token in localStorage
          window.location.href = '/dashboard'; // Redirect to the dashboard
        } else {
          alert('Login failed: ' + data.message); // Show error message
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. Please try again.');
      }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
  
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
        if (response.ok) {
          alert('Registration successful. Please log in.'); // Inform the user
          window.location.href = '/login'; // Redirect to the login page
        } else {
          alert('Registration failed: ' + data.message); // Show error message
        }
      } catch (error) {
        console.error('Error during registration:', error);
        alert('Registration failed. Please try again.');
      }
    });
  });