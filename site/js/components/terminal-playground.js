/**
 * Terminal playground — mock corpus + grep vs top-k contrast.
 */

export function mount(container, config = {}) {
  const files = config.files || {};
  const presets = config.presets || [];

  container.className = 'playground playground--terminal';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Terminal corpus sandbox</h3>
      <p class="playground__subtitle">Run grep on a mock corpus. Compare what the agent sees vs what a top-k retriever would return.</p>
    </div>
    <div class="terminal-layout">
      <div class="playground__panel terminal-panel">
        <span class="playground__label">Command</span>
        <div class="terminal-input-row">
          <span class="terminal-prompt">$</span>
          <input type="text" class="terminal-input" data-terminal-input placeholder="grep SKU-8842 contracts.txt">
        </div>
        <div class="terminal-presets" data-terminal-presets></div>
        <span class="playground__label">Output (what DCI agent observes)</span>
        <pre class="terminal-output" data-terminal-output></pre>
      </div>
      <div class="playground__panel terminal-panel">
        <span class="playground__label">Top-k retriever <span class="playground__value" data-terminal-topk-val>3</span></span>
        <input type="range" min="1" max="8" value="3" data-terminal-topk style="margin-bottom:var(--space-3);width:100%;">
        <div data-terminal-retrieval></div>
        <p class="playground__insight" data-terminal-insight></p>
      </div>
    </div>
  `;

  const input = container.querySelector('[data-terminal-input]');
  const output = container.querySelector('[data-terminal-output]');
  const retrieval = container.querySelector('[data-terminal-retrieval]');
  const insight = container.querySelector('[data-terminal-insight]');
  const presetsEl = container.querySelector('[data-terminal-presets]');
  const topKSlider = container.querySelector('[data-terminal-topk]');
  const topKVal = container.querySelector('[data-terminal-topk-val]');
  let topK = config.topK || 3;

  presetsEl.innerHTML = presets.map(p =>
    `<button type="button" class="btn btn--ghost terminal-preset-btn" data-cmd="${escapeAttr(p.cmd)}">${p.label}</button>`
  ).join('');

  const tokenize = (s) => s.toLowerCase().split(/\W+/).filter(Boolean);

  const runGrep = (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return { lines: [], note: 'Type a command.' };

    const parts = trimmed.split(/\s+/);
    const isPipe = trimmed.includes('|');
    let patterns = [];
    if (isPipe) {
      const segments = trimmed.split('|').map(s => s.trim());
      segments.forEach(seg => {
        const m = seg.match(/grep\s+['"]?([^'"]+)['"]?/i) || seg.match(/grep\s+(\S+)/i);
        if (m) patterns.push(m[1].replace(/['"]/g, ''));
      });
    } else {
      const m = trimmed.match(/grep\s+(?:-r\s+)?['"]?([^'"]+)['"]?/i) || trimmed.match(/grep\s+(\S+)/i);
      if (m) patterns.push(m[1].replace(/['"]/g, ''));
    }

    if (!patterns.length) return { lines: [], note: 'Try: grep SKU-8842 contracts.txt' };

    let results = [];
    Object.entries(files).forEach(([path, content]) => {
      const fileMatch = !trimmed.includes('.txt') && !trimmed.includes('.md') || trimmed.includes(path);
      if (trimmed.includes(path) || trimmed.includes('-r') || !trimmed.match(/\.\w+/)) {
        content.split('\n').forEach((line, i) => {
          const ok = patterns.every(p => line.toLowerCase().includes(p.toLowerCase()));
          if (ok && line.trim()) results.push({ path, line: i + 1, text: line });
        });
      }
    });

    if (isPipe && patterns.length > 1) {
      results = results.filter(r => patterns.every(p => r.text.toLowerCase().includes(p.toLowerCase())));
    }

    return { lines: results, note: results.length ? `${results.length} match(es)` : 'No matches.' };
  };

  const runRetriever = (cmd) => {
    const q = tokenize(cmd.replace(/grep|rg|['"|]/g, ' ')).filter(t => t.length > 2);
    if (!q.length) return [];

    return Object.entries(files).map(([path, content]) => {
      const text = content.toLowerCase();
      const score = q.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0) / q.length;
      return { path, text: content.slice(0, 120), score };
    }).sort((a, b) => b.score - a.score).slice(0, topK);
  };

  const render = () => {
    const cmd = input.value;
    const { lines, note } = runGrep(cmd);
    output.textContent = lines.length
      ? lines.map(r => `${r.path}:${r.line}: ${r.text}`).join('\n')
      : note;

    topKVal.textContent = topK;
    const ranked = runRetriever(cmd);
    retrieval.innerHTML = ranked.length
      ? ranked.map((r, i) => `<div class="terminal-rank"><span>#${i + 1}</span><strong>${r.path}</strong><p>${escapeHtml(r.text)}…</p><code>${r.score.toFixed(2)}</code></div>`).join('')
      : '<p class="playground__hint">Retriever returns unrelated chunks when exact terms are missing from embedding match.</p>';

    const exactHit = lines.some(l => l.text.includes('SKU-8842') || l.text.includes('ERROR-4429'));
    insight.textContent = exactHit
      ? 'DCI found exact lexical match. Dense retriever may rank paraphrases higher and miss the SKU.'
      : 'Try preset: grep SKU-8842 or piped clue conjunction.';
  };

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') render(); });
  presetsEl.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', () => { input.value = btn.getAttribute('data-cmd'); render(); });
  });

  topKSlider.addEventListener('input', () => {
    topK = parseInt(topKSlider.value, 10);
    render();
  });

  if (presets[0]) input.value = presets[0].cmd;
  render();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return s.replace(/"/g, '&quot;');
}
