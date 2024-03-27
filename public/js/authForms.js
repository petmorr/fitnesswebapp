document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitForm('/api/register', new FormData(registerForm));
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            console.log('Login Form');
            e.preventDefault();
            submitForm('/api/login', new FormData(loginForm));
        });
    }
});

async function submitForm(url, formData) {
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok && result.success) {
            // Redirect based on the action URL
            window.location.href = url.includes('register') ? '/login' : '/dashboard';
        } else {
            // Display error message
            document.getElementById('errorMessage').textContent = result.errorMessage || 'An error occurred.';
        }
    } catch (error) {
        document.getElementById('errorMessage').textContent = 'An error occurred.';
    }
}