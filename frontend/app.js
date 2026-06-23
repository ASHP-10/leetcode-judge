const statusElement = document.getElementById('status');
const problemsElement = document.getElementById('problems');

// Create a list item element for a problem entry.
// Builds a link with problem id, name and difficulty badge.
function createProblemItem(problem) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'problem-item';
    link.href = `./problem.html?id=${encodeURIComponent(problem.problemId)}`;

    const id = document.createElement('span');
    id.className = 'problem-id';
    id.textContent = `#${problem.problemId ?? '-'}`;

    const name = document.createElement('span');
    name.className = 'problem-name';
    name.textContent = problem.problemName || 'Untitled problem';

    const difficulty = document.createElement('span');
    const difficultyValue = problem.difficulty || 'Unknown';
    difficulty.className = `difficulty ${difficultyValue.toLowerCase()}`;
    difficulty.textContent = difficultyValue;

    link.append(id, name, difficulty);
    item.appendChild(link);
    return item;
}

async function loadProblems() {
    // Fetch the problem list from the backend and render on the page.
    try {
        const response = await fetch('http://localhost:3000/problem');

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const problems = await response.json();
        problemsElement.innerHTML = '';

        if (!Array.isArray(problems) || problems.length === 0) {
            statusElement.textContent = 'No problems found.';
            return;
        }

        for (const problem of problems) {
            problemsElement.appendChild(createProblemItem(problem));
        }

        statusElement.textContent = '';
    } catch (error) {
        statusElement.textContent = `Could not load problems: ${error.message}`;
    }
}

loadProblems();
