document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelectorAll('input[type="password"]')[0].value;
  const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
  const role = document.getElementById('registerForm').querySelector('select[name="role"]').value;
  
  if (!email || !password || !confirmPassword) {
    alert('Please fill in all fields.');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    
    if (response.ok) {
      alert('Registration successful');
    } else {
      alert('Registration failed');
    }
  } catch (error) {
    alert('Error communicating with the server');
  }
});
