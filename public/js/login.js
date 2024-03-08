// Login form submission
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        alert('Login successful');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Error communicating with the server');
    }
});  