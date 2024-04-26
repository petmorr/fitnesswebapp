// Handles form submissions for authentication (login and registration)
document.addEventListener('DOMContentLoaded', () => {
    setupFormSubmission('registerForm', '/api/register');
    setupFormSubmission('loginForm', '/api/login');
});

function setupFormSubmission(formId, actionUrl) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            submitForm(actionUrl, new FormData(form));
        });
    }
}

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
            window.location.href = url.includes('register') ? '/login' : '/dashboard';
        } else {
            document.getElementById('errorMessage').textContent = result.errorMessage || 'An error occurred.';
        }
    } catch (error) {
        document.getElementById('errorMessage').textContent = 'An error occurred.';
    }
}