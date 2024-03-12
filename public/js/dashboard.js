const token = localStorage.getItem('token');
fetch('/dashboard', {
  headers: {
    'Authorization': `Bearer ` + localStorage.getItem('token') // Send the token in the header 
  }
})
.then(response => response.json())
.then(data => {
  // Process the data for dashboard
})
.catch(error => console.error('Error accessing dashboard:', error));