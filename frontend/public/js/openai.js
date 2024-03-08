async function askQuestion() {
    const question = document.getElementById('question').value;
    const response = await fetch('/api/workout/get-advice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
    });
    const data = await response.json();
    document.getElementById('advice').innerText = data.advice;
}