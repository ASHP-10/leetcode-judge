const statusEl = document.getElementById('status');
const container = document.getElementById('submission-container');

// Read `submissionId` from query string
function getParams() {
    const params = new URLSearchParams(window.location.search);
    return { submissionId: params.get('submissionId') };
}

// Parse DynamoDB attribute value objects into plain JS values.
function parseDynamoValue(attr) {
    if (attr === null || attr === undefined) return null;
    if ('S' in attr) return attr.S;
    if ('N' in attr) return attr.N;
    if ('BOOL' in attr) return attr.BOOL;
    if ('NULL' in attr) return null;
    if ('M' in attr) {
        const out = {};
        for (const [k, v] of Object.entries(attr.M)) out[k] = parseDynamoValue(v);
        return out;
    }
    if ('L' in attr) return attr.L.map(parseDynamoValue);
    return attr;
}

// Convert an entire DynamoDB Item (map of attributes) to a plain object.
function parseDynamoItem(item) {
    const out = {};
    for (const [k, v] of Object.entries(item)) {
        out[k] = parseDynamoValue(v);
    }
    return out;
}

// Render a simple key/value table for the parsed submission object.
function renderTable(obj) {
    container.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = `Submission ${obj.submissionId || ''}`;
    container.appendChild(title);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const keys = Object.keys(obj);
    for (const key of keys) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = key;
        th.style.textAlign = 'left';
        th.style.padding = '8px';
        th.style.border = '1px solid #ddd';

        const td = document.createElement('td');
        const val = obj[key];
        td.textContent = val === undefined || val === null ? '' : (typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';

        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
    }

    container.appendChild(table);
}

// Poll `/submission/:submissionId` until DynamoDB `Item.status.S` is not 'PENDING'.
async function pollSubmission(submissionId) {
    statusEl.textContent = 'Waiting for result...';
    container.innerHTML = '<p>Loading submission result...</p>';

    const url = `http://localhost:3000/submission/${encodeURIComponent(submissionId)}`;

    while (true) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                statusEl.textContent = `Request failed: ${res.status}`;
                return;
            }

            const data = await res.json();
            const item = data && data.Item ? data.Item : null;
            if (!item) {
                statusEl.textContent = 'No item returned yet.';
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            const statusAttr = item.status && item.status.S ? item.status.S : null;
            if (statusAttr === 'PENDING') {
                statusEl.textContent = 'Pending...';
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            const parsed = parseDynamoItem(item);
            statusEl.textContent = '';
            renderTable(parsed);
            return;
        } catch (err) {
            statusEl.textContent = `Polling error: ${err.message}`;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

// Entry point: start polling when page loads.
function start() {
    const { submissionId } = getParams();
    if (!submissionId) {
        statusEl.textContent = 'Missing submissionId in URL.';
        return;
    }

    pollSubmission(submissionId);
}

document.addEventListener('DOMContentLoaded', start);
