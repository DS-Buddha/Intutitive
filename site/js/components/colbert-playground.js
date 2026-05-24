/**
 * ColBERT MaxSim — token-level late interaction matrix.
 */

import { tokenize } from '../core/text-math.js';

export function mount(container, config = {}) {
  const query = config.query || '';
  const docs = config.docs || [];
  container.className = 'playground playground--colbert';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">ColBERT MaxSim sandbox</h3>
      <p class="playground__subtitle">Each query token picks its best match in each document. Sum of max similarities = late interaction score.</p>
    </div>
    <input type="text" class="playground__input" data-colbert-query>
    <div class="colbert-layout">
      <div class="playground__panel" data-colbert-matrix></div>
      <div class="playground__panel">
        <span class="playground__label">Document scores</span>
        <div data-colbert-scores></div>
      </div>
    </div>
  `;

  const queryInput = container.querySelector('[data-colbert-query]');
  const matrixEl = container.querySelector('[data-colbert-matrix]');
  const scoresEl = container.querySelector('[data-colbert-scores]');
  queryInput.value = query;

  const tokenSim = (a, b) => {
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.6;
    const shared = a.split('').filter(c => b.includes(c)).length;
    return Math.min(0.4, shared / Math.max(a.length, b.length));
  };

  const render = () => {
    const qTokens = tokenize(queryInput.value);
    const docTokens = docs.map(d => tokenize(d.text));

    const maxSims = docs.map((doc, di) => {
      let total = 0;
      const perQuery = qTokens.map(qt => {
        const sims = docTokens[di].map(dt => tokenSim(qt, dt));
        const max = sims.length ? Math.max(...sims) : 0;
        total += max;
        return { max, argmax: sims.indexOf(max) };
      });
      return { label: doc.label, total, perQuery };
    }).sort((a, b) => b.total - a.total);

    matrixEl.innerHTML = `
      <span class="playground__label">MaxSim matrix (query tokens × doc tokens)</span>
      <div class="colbert-docs">${docs.map((d, di) => `
        <div class="colbert-doc-block">
          <strong>${d.label}</strong>
          <table class="colbert-table">
            <thead><tr><th>Q token</th>${docTokens[di].map(t => `<th>${t}</th>`).join('')}</tr></thead>
            <tbody>${qTokens.map((qt, qi) => {
              const sims = docTokens[di].map(dt => tokenSim(qt, dt));
              const maxIdx = sims.indexOf(Math.max(...sims));
              return `<tr><td>${qt}</td>${sims.map((s, j) =>
                `<td class="${j === maxIdx ? 'colbert-cell--max' : ''}">${s.toFixed(2)}</td>`).join('')}</tr>`;
            }).join('')}</tbody>
          </table>
        </div>`).join('')}</div>`;

    scoresEl.innerHTML = maxSims.map((s, i) => `
      <div class="colbert-score-row">
        <span>#${i + 1} ${s.label}</span>
        <strong>${s.total.toFixed(2)}</strong>
        <span class="colbert-score-detail">${s.perQuery.map(p => p.max.toFixed(2)).join(' + ')}</span>
      </div>`).join('');
  };

  queryInput.addEventListener('input', render);
  render();
}
