const statusElement = document.getElementById('status');
const detailElement = document.getElementById('problem-detail');
const problemIdElement = document.getElementById('problem-id');
const problemNameElement = document.getElementById('problem-name');
const difficultyElement = document.getElementById('difficulty');
const descriptionElement = document.getElementById('description');
const testCasesElement = document.getElementById('test-cases');
const submissionForm = document.getElementById('submission-form');
const languageElement = document.getElementById('language');
const codeElement = document.getElementById('code');
const submissionStatusElement = document.getElementById('submission-status');

function getProblemId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Helper: read `id` from URL query string.

function normalizeTestCases(problem) {
    const testCases = problem.testCases || [];

    if (Array.isArray(testCases)) {
        return testCases;
    }

    if (testCases && typeof testCases === 'object') {
        return Object.entries(testCases).map(([testCase, output]) => ({
            case: testCase,
            output
        }));
    }

    return [];
}

function formatValue(value) {
    if (typeof value === 'string') {
        return value;
    }

    return JSON.stringify(value, null, 2);
}

function createMapRow(label, value) {
    const row = document.createElement('div');
    row.className = 'map-row';

    const key = document.createElement('div');
    key.className = 'map-key';
    key.textContent = label;

    const mapValue = document.createElement('pre');
    mapValue.className = 'map-value';
    mapValue.textContent = formatValue(value);

    row.append(key, mapValue);
    return row;
}

function renderTestCase(testCase, index) {
    const container = document.createElement('article');
    container.className = 'test-case';

    const title = document.createElement('h3');
    title.textContent = `Test Case ${index + 1}`;
    container.appendChild(title);

    if (testCase && typeof testCase === 'object' && !Array.isArray(testCase)) {
        if ('case' in testCase) {
            container.appendChild(createMapRow('case', testCase.case));
        }

        if ('output' in testCase) {
            container.appendChild(createMapRow('output', testCase.output));
        }

        for (const [key, value] of Object.entries(testCase)) {
            if (key === 'case' || key === 'output') {
                continue;
            }

            container.appendChild(createMapRow(key, value));
        }
    } else {
        container.appendChild(createMapRow('value', testCase));
    }

    return container;
}

function renderProblem(problem) {
    // Populate DOM nodes with problem details fetched from the server.
    const difficultyValue = problem.difficulty || 'Unknown';

    problemIdElement.textContent = `#${problem.problemId ?? '-'}`;
    problemNameElement.textContent = problem.problemName || 'Untitled problem';
    difficultyElement.className = `difficulty ${difficultyValue.toLowerCase()}`;
    difficultyElement.textContent = difficultyValue;
    descriptionElement.textContent = problem.description || problem.problemDescription || 'No description available.';

    const testCases = normalizeTestCases(problem);
    testCasesElement.innerHTML = '';

    if (!Array.isArray(testCases) || testCases.length === 0) {
        testCasesElement.textContent = 'No test cases found.';
    } else {
        testCases.forEach((testCase, index) => {
            testCasesElement.appendChild(renderTestCase(testCase, index));
        });
    }

    statusElement.textContent = '';
    detailElement.hidden = false;
}

async function loadProblem() {
    const problemId = getProblemId();

    if (!problemId) {
        statusElement.textContent = 'Missing problem id.';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/problem/${encodeURIComponent(problemId)}`);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const problem = await response.json();
        renderProblem(problem);
    } catch (error) {
        statusElement.textContent = `Could not load problem: ${error.message}`;
    }
}

async function submitSolution(event) {
    event.preventDefault();

    const problemId = getProblemId();
    const code = codeElement.value.trim();
    const language = languageElement.value;
    const method = event.submitter?.value;

    if (!code) {
        submissionStatusElement.textContent = 'Please enter your code before submitting.';
        return;
    }

    if (!method) {
        submissionStatusElement.textContent = 'Please choose a submission method.';
        return;
    }

    // POST submission and redirect to submission view using returned id.
    submissionStatusElement.textContent = 'Submitting...';

    try {
        const response = await fetch('http://localhost:3000/submission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                problemId,
                language,
                code,
                method
            })
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const submissionId = data.submissionId || data.id || data;
        if (submissionId) {
            // Navigate to the submission page with only submissionId
            window.location.href = `./submission.html?submissionId=${encodeURIComponent(submissionId)}`;
        } else {
            submissionStatusElement.textContent = 'Submitted but did not receive a submission id.';
        }
    } catch (error) {
        submissionStatusElement.textContent = `Could not submit solution: ${error.message}`;
    }
}

submissionForm.addEventListener('submit', submitSolution);
loadProblem();
