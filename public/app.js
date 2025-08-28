async function postJSON(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function classify(score) {
  if (score < 0.2) return 'low';
  if (score < 0.6) return 'medium';
  return 'high';
}

function renderResult(container, item) {
  const { download, scan, explanation } = item;
  const div = document.createElement('div');
  div.className = 'card';
  const riskClass = classify(scan.weightedRiskScore);
  div.innerHTML = `
    <div class="row" style="justify-content: space-between; align-items: center;">
      <div>
        <div><strong>${scan.fileName}</strong></div>
        <div class="badge">${scan.mimeType || 'unknown'}</div>
        <div class="badge">${(scan.fileSizeBytes/1024/1024).toFixed(2)} MB</div>
      </div>
      <div class="score ${riskClass}">Risk: ${(scan.weightedRiskScore*100).toFixed(1)}%</div>
    </div>
    <div style="margin-top:8px">
      <strong>Findings</strong>
      <ul>
        ${scan.findings.map(f => `<li>${f.engine}: ${f.malicious ? 'malicious' : 'clean'}${f.labels?.length ? ` — ${f.labels.join(', ')}` : ''}</li>`).join('')}
      </ul>
    </div>
    <div style="margin-top:8px">
      <strong>Explanation</strong>
      <pre>${explanation || '—'}</pre>
    </div>
  `;
  container.appendChild(div);
}

document.getElementById('scan-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('url').value.trim();
  const selector = document.getElementById('selector').value.trim();
  const max = Number(document.getElementById('max').value || 3);
  const results = document.getElementById('results');
  results.innerHTML = '';

  const btn = e.target.querySelector('button');
  btn.disabled = true; btn.textContent = 'Scanning...';
  try {
    const payload = { url, selector: selector || undefined, max };
    const data = await postJSON('/api/scan', payload);
    if (Array.isArray(data.results)) {
      data.results.forEach(item => renderResult(results, item));
    } else {
      results.textContent = 'No results.';
    }
  } catch (err) {
    results.textContent = String(err);
  } finally {
    btn.disabled = false; btn.textContent = 'Scan';
  }
});

