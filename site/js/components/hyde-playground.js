/**
 * HyDE — compare direct query embedding vs hypothetical document retrieval.
 */

import { buildVocabulary, toTfidfVector, cosineSimilarity } from '../core/text-math.js';

export function mount(container, config = {}) {
  const corpus = config.corpus || [];
  container.className = 'playground playground--hyde';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">HyDE sandbox</h3>
      <p class="playground__subtitle">Short questions embed poorly. HyDE generates a hypothetical answer first, then retrieves with that vector.</p>
    </div>
    <input type="text" class="playground__input" data-hyde-query>
    <div class="hyde-layout">
      <div class="playground__panel">
        <span class="playground__label">Direct query retrieval</span>
        <div data-hyde-direct></div>
      </div>
      <div class="playground__panel">
        <span class="playground__label">HyDE path</span>
        <div class="hyde-hypo callout" data-hyde-hypo></div>
        <div data-hyde-hyde></div>
      </div>
    </div>
  `;

  const queryInput = container.querySelector('[data-hyde-query]');
  const directEl = container.querySelector('[data-hyde-direct]');
  const hypoEl = container.querySelector('[data-hyde-hypo]');
  const hydeEl = container.querySelector('[data-hyde-hyde]');
  queryInput.value = config.defaultQuery || '';

  const rank = (text) => {
    const docs = corpus.map(c => c.text);
    const vocab = buildVocabulary([...docs, text]);
    const qVec = toTfidfVector(text, vocab, docs);
    return corpus.map((c, i) => ({
      index: i, label: c.label,
      score: cosineSimilarity(qVec, toTfidfVector(c.text, vocab, docs)),
    })).sort((a, b) => b.score - a.score);
  };

  const renderList = (items) => items.slice(0, 4).map((r, i) =>
    `<div class="hyde-rank"><span>#${i + 1}</span><span>${r.label}</span><code>${r.score.toFixed(3)}</code></div>`
  ).join('');

  const render = () => {
    const q = queryInput.value;
    const hypo = (config.hypotheticalTemplate || 'The answer is: {query}').replace('{query}', q);
    directEl.innerHTML = renderList(rank(q));
    hypoEl.innerHTML = `<strong>Generated hypothetical doc:</strong><p>${hypo}</p>`;
    hydeEl.innerHTML = renderList(rank(hypo));
  };

  queryInput.addEventListener('input', render);
  render();
}
