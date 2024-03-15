document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const formData = new FormData(this);

  try {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
    });

    const data = await response.json();
    if (data.token) {
        // Store the token and redirect to the dashboard
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard'; 
    } else {
        // Handle login failure
        console.error(data.error);
    }
} catch (error) {
    console.error('Login request failed', error);
}
});