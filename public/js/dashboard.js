const token = localStorage.getItem('token');
if (token) {
    fetch('/dashboard', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}