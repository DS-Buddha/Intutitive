/**
 * Hybrid search — compare BM25 (lexical), dense, and fused rankings.
 */

import { buildVocabulary, toTfidfVector, cosineSimilarity, tokenize } from '../core/text-math.js';

export function mount(container, config = {}) {
  const corpus = config.corpus || [];
  container.className = 'playground playground--hybrid';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Hybrid retrieval sandbox</h3>
      <p class="playground__subtitle">Same query, three strategies. Dense misses exact IDs; BM25 misses paraphrases; hybrid combines both.</p>
    </div>
    <input type="text" class="playground__input" data-hybrid-query placeholder="Try: SKU-8842 warranty">
    <div class="hybrid-grid" data-hybrid-grid></div>
    <p class="playground__insight" data-hybrid-insight></p>
  `;

  const queryInput = container.querySelector('[data-hybrid-query]');
  const grid = container.querySelector('[data-hybrid-grid]');
  const insight = container.querySelector('[data-hybrid-insight]');
  queryInput.value = config.defaultQuery || '';

  const bm25Score = (query, doc) => {
    const qTerms = tokenize(query);
    const dTerms = tokenize(doc);
    if (!qTerms.length) return 0;
    let score = 0;
    qTerms.forEach(t => { if (dTerms.includes(t)) score += 1; });
    return score / qTerms.length;
  };

  const rrfFuse = (bm25Rank, denseRank, k = 60) => {
    const scores = {};
    bm25Rank.forEach((idx, rank) => { scores[idx] = (scores[idx] || 0) + 1 / (k + rank + 1); });
    denseRank.forEach((idx, rank) => { scores[idx] = (scores[idx] || 0) + 1 / (k + rank + 1); });
    return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([idx, s]) => ({ index: parseInt(idx, 10), score: s }));
  };

  const render = () => {
    const query = queryInput.value;
    const docs = corpus.map(c => c.text);
    const vocab = buildVocabulary([...docs, query]);
    const qVec = toTfidfVector(query, vocab, docs);

    const dense = corpus.map((c, i) => ({
      index: i, label: c.label, text: c.text,
      score: cosineSimilarity(qVec, toTfidfVector(c.text, vocab, docs)),
    })).sort((a, b) => b.score - a.score);

    const bm25 = corpus.map((c, i) => ({
      index: i, label: c.label, text: c.text, score: bm25Score(query, c.text),
    })).sort((a, b) => b.score - a.score);

    const fused = rrfFuse(bm25.map(x => x.index), dense.map(x => x.index));

    const col = (title, items, isFused) => `
      <div class="hybrid-col">
        <h4>${title}</h4>
        ${items.slice(0, 4).map((item, rank) => {
          const doc = corpus[item.index];
          const sc = item.score.toFixed(3);
          return `<div class="hybrid-rank"><span>#${rank + 1}</span><span>${doc?.label || ''}</span><code>${sc}</code></div>`;
        }).join('')}
      </div>`;

    grid.innerHTML = col('BM25 (lexical)', bm25, false) + col('Dense (semantic)', dense, false) +
      col('Hybrid (RRF fusion)', fused.map(f => ({ ...f, label: corpus[f.index].label, text: corpus[f.index].text })), true);

    insight.textContent = config.insight ||
      'Notice: exact product codes rank high in BM25; paraphrased questions rank high in dense. Hybrid keeps both signals.';
  };

  queryInput.addEventListener('input', render);
  render();
}
