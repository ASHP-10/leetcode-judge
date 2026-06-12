const statusElement = document.getElementById('status');
const problemsElement = document.getElementById('problems');

function createProblemItem(problem) {
    const item = document.createElement('li');
    item.className = 'problem-item';

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

    item.append(id, name, difficulty);
    return item;
}

async function loadProblems() {
    try {
        const response = await fetch('http://localhost:3000/problems');

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
