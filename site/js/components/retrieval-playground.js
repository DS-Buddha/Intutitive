/**
 * Retrieval Playground — editable corpus, dot product breakdown, threshold, inspect any rank.
 */

import { on, emit } from '../core/eventbus.js';
import {
  buildVocabulary,
  toTfidfVector,
  cosineSimilarity,
  project2D,
  dotProductBreakdown,
} from '../core/text-math.js';

export function mount(container, config = {}) {
  const cfg = {
    corpus: config.corpus || [],
    defaultQuery: config.defaultQuery || '',
    defaultTopK: config.defaultTopK || 3,
    defaultThreshold: config.defaultThreshold || 0,
  };

  container.className = 'playground playground--retrieval';
  container.innerHTML = buildShell(cfg);

  const state = {
    query: cfg.defaultQuery,
    topK: cfg.defaultTopK,
    threshold: cfg.defaultThreshold,
    corpus: cfg.corpus.map((c, i) => ({ ...c, index: i })),
    inspectIdx: 0,
    pipedChunks: null,
  };

  const els = {
    query: container.querySelector('[data-retrieval-query]'),
    topK: container.querySelector('[data-retrieval-topk]'),
    topKVal: container.querySelector('[data-retrieval-topk-val]'),
    threshold: container.querySelector('[data-retrieval-threshold]'),
    thresholdVal: container.querySelector('[data-retrieval-threshold-val]'),
    syncBtn: container.querySelector('[data-retrieval-sync]'),
    corpus: container.querySelector('[data-retrieval-corpus]'),
    canvas: container.querySelector('[data-retrieval-canvas]'),
    ranks: container.querySelector('[data-retrieval-ranks]'),
    breakdown: container.querySelector('[data-retrieval-breakdown]'),
    magnitudes: container.querySelector('[data-retrieval-magnitudes]'),
    formula: container.querySelector('[data-retrieval-formula]'),
    tooltip: container.querySelector('[data-retrieval-tooltip]'),
  };

  els.query.value = state.query;
  els.topKVal.textContent = state.topK;
  els.thresholdVal.textContent = state.threshold.toFixed(2);

  on('playground:chunks-updated', ({ texts }) => {
    state.pipedChunks = texts;
  });

  els.syncBtn.addEventListener('click', () => {
    if (state.pipedChunks?.length) {
      state.corpus = state.pipedChunks.map((text, i) => ({
        label: `Chunk ${i + 1}`,
        text,
        index: i,
      }));
      renderCorpusEditor(els.corpus, state);
      render();
      emit('playground:corpus-updated', { corpus: state.corpus });
    }
  });

  const render = () => {
    state.query = els.query.value;
    state.topK = parseInt(els.topK.value, 10);
    state.threshold = parseFloat(els.threshold.value);

    const docs = state.corpus.map(c => c.text);
    if (docs.length === 0) return;

    const vocab = buildVocabulary([...docs, state.query]);
    const queryVec = toTfidfVector(state.query, vocab, docs);

    const ranked = state.corpus.map((chunk, index) => {
      const vec = toTfidfVector(chunk.text, vocab, docs);
      return {
        ...chunk,
        index,
        vector: vec,
        similarity: cosineSimilarity(queryVec, vec),
      };
    }).sort((a, b) => b.similarity - a.similarity);

    const inspectItem = ranked.find(r => r.index === state.inspectIdx) || ranked[0];
    if (inspectItem) state.inspectIdx = inspectItem.index;

    const allVecs = [...docs.map(d => toTfidfVector(d, vocab, docs)), queryVec];
    const positions = project2D(allVecs);
    const queryPos = positions[positions.length - 1];
    const chunkPositions = positions.slice(0, -1);

    renderCanvas(els.canvas, chunkPositions, queryPos, ranked, state, (idx) => {
      state.inspectIdx = idx;
      render();
    });
    renderRanks(els.ranks, ranked, state, (idx) => {
      state.inspectIdx = idx;
      render();
    });
    renderBreakdown(els.breakdown, els.magnitudes, state.query, inspectItem?.text || '', vocab, docs);
    renderFormula(els.formula, ranked, state);

    emit('playground:query-updated', { query: state.query, topK: state.topK, ranked });
  };

  els.query.addEventListener('input', render);
  els.topK.addEventListener('input', () => {
    els.topKVal.textContent = els.topK.value;
    render();
  });
  els.threshold.addEventListener('input', () => {
    els.thresholdVal.textContent = parseFloat(els.threshold.value).toFixed(2);
    render();
  });

  renderCorpusEditor(els.corpus, state, render);
  render();
}

function buildShell(cfg) {
  return `
    <div class="playground__header">
      <h3 class="playground__title">Retrieval sandbox</h3>
      <p class="playground__subtitle">Edit the corpus, type a query, click any rank to inspect the dot product math. Sync chunks from the chunking sandbox above.</p>
    </div>

    <div class="playground__controls">
      <button type="button" class="btn-secondary playground-sync-btn" data-retrieval-sync>Use chunks from chunking sandbox</button>
      <div class="playground__control-group playground__control-group--wide">
        <label class="playground__label" for="retrieval-query">Your query</label>
        <input type="text" id="retrieval-query" class="playground__input" data-retrieval-query
          placeholder="e.g. What was Q3 revenue?" value="${escapeAttr(cfg.defaultQuery)}">
      </div>
      <div class="playground__control-group">
        <label class="playground__label" for="retrieval-topk">Top-k</label>
        <input type="range" id="retrieval-topk" data-retrieval-topk min="1" max="6" step="1" value="${cfg.defaultTopK}">
        <span class="playground__value" data-retrieval-topk-val>${cfg.defaultTopK}</span>
      </div>
      <div class="playground__control-group">
        <label class="playground__label" for="retrieval-threshold">Min similarity</label>
        <input type="range" id="retrieval-threshold" data-retrieval-threshold min="0" max="0.8" step="0.05" value="${cfg.defaultThreshold}">
        <span class="playground__value" data-retrieval-threshold-val>${cfg.defaultThreshold.toFixed(2)}</span>
      </div>
    </div>

    <div class="playground__panel">
      <span class="playground__label">Corpus — edit chunk text to see rankings change</span>
      <div class="retrieval-corpus" data-retrieval-corpus></div>
    </div>

    <div class="retrieval-layout">
      <div class="playground__panel">
        <span class="playground__label">Vector space (2D projection)</span>
        <div class="retrieval-canvas-wrap">
          <svg class="retrieval-canvas" data-retrieval-canvas viewBox="0 0 400 320" role="img"></svg>
          <div class="retrieval-tooltip" data-retrieval-tooltip hidden></div>
        </div>
      </div>
      <div class="playground__panel">
        <span class="playground__label">Ranked results — click to inspect</span>
        <div class="retrieval-ranks" data-retrieval-ranks></div>
      </div>
    </div>

    <div class="playground__panel">
      <span class="playground__label">Dot product breakdown — selected chunk vs query</span>
      <div class="retrieval-magnitudes" data-retrieval-magnitudes></div>
      <div class="dot-product-table-wrap" data-retrieval-breakdown></div>
    </div>

    <p class="playground__formula" data-retrieval-formula></p>
  `;
}

function renderCorpusEditor(el, state, onChange) {
  el.innerHTML = state.corpus.map((c, i) => `
    <div class="retrieval-corpus__item">
      <label class="playground__label">${escapeHtml(c.label || `Chunk ${i + 1}`)}</label>
      <textarea class="playground__textarea retrieval-corpus__text" data-corpus-idx="${i}" rows="2">${escapeHtml(c.text)}</textarea>
    </div>
  `).join('');

  el.querySelectorAll('[data-corpus-idx]').forEach(ta => {
    ta.addEventListener('input', () => {
      const idx = parseInt(ta.getAttribute('data-corpus-idx'), 10);
      state.corpus[idx].text = ta.value;
      onChange?.();
    });
  });
}

function renderCanvas(svg, chunkPositions, queryPos, ranked, state, onSelect) {
  const pad = 40;
  const w = 400;
  const h = 320;
  const all = [...chunkPositions, queryPos];
  const xs = all.map(p => p.x);
  const ys = all.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const scale = (p) => ({
    x: pad + ((p.x - minX) / rangeX) * (w - pad * 2),
    y: pad + ((p.y - minY) / rangeY) * (h - pad * 2),
  });

  const q = scale(queryPos);
  const topIndices = new Set(
    ranked.filter(r => r.similarity >= state.threshold).slice(0, state.topK).map(r => r.index)
  );

  const lines = ranked.map(r => {
    const p = scale(chunkPositions[r.index]);
    const passThreshold = r.similarity >= state.threshold;
    const retrieved = topIndices.has(r.index);
    const stroke = retrieved ? 'var(--color-accent-primary)' : 'var(--color-border)';
    return `<line x1="${q.x}" y1="${q.y}" x2="${p.x}" y2="${p.y}"
      stroke="${stroke}" stroke-width="${retrieved ? 2 : 1}" opacity="${passThreshold ? Math.max(0.2, r.similarity) : 0.08}"
      stroke-dasharray="${retrieved ? 'none' : '4 4'}"/>`;
  }).join('');

  const dots = ranked.map(r => {
    const p = scale(chunkPositions[r.index]);
    const retrieved = topIndices.has(r.index);
    const below = r.similarity < state.threshold;
    const selected = r.index === state.inspectIdx;
    const fill = below ? 'var(--color-bg-elevated)' : retrieved ? 'var(--stage-retrieve)' : 'var(--color-bg-surface)';
    const stroke = selected ? 'var(--color-accent-warning)' : retrieved ? 'var(--color-accent-primary)' : 'var(--color-border)';
    const rVal = selected ? 16 : retrieved ? 14 : 10;
    return `
      <g class="retrieval-dot retrieval-dot--click" data-inspect-idx="${r.index}" style="cursor:pointer">
        <circle cx="${p.x}" cy="${p.y}" r="${rVal}" fill="${fill}" stroke="${stroke}" stroke-width="${selected ? 3 : 2}" opacity="${below ? 0.4 : 1}"/>
        <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" fill="var(--color-text-primary)" font-size="10" font-weight="600">${r.index + 1}</text>
        <title>${escapeAttr(r.label || `Chunk ${r.index + 1}`)}: ${r.similarity.toFixed(3)}</title>
      </g>`;
  }).join('');

  svg.innerHTML = `
    <rect x="0" y="0" width="${w}" height="${h}" fill="var(--color-bg-base)" rx="8"/>
    ${lines}${dots}
    <g><circle cx="${q.x}" cy="${q.y}" r="16" fill="var(--stage-generate)" stroke="var(--color-text-inverse)" stroke-width="2"/>
    <text x="${q.x}" y="${q.y + 5}" text-anchor="middle" fill="var(--color-text-inverse)" font-size="11" font-weight="700">Q</text></g>`;

  svg.querySelectorAll('[data-inspect-idx]').forEach(g => {
    g.addEventListener('click', () => onSelect(parseInt(g.getAttribute('data-inspect-idx'), 10)));
  });
}

function renderRanks(el, ranked, state, onSelect) {
  el.innerHTML = ranked.map((r, rank) => {
    const passThreshold = r.similarity >= state.threshold;
    const retrieved = passThreshold && rank < state.topK;
    const selected = r.index === state.inspectIdx;
    const barWidth = Math.max(2, Math.round(r.similarity * 100));
    return `
      <div class="retrieval-rank retrieval-rank--click ${retrieved ? 'retrieval-rank--hit' : ''} ${!passThreshold ? 'retrieval-rank--below' : ''} ${selected ? 'retrieval-rank--selected' : ''}"
        data-inspect-idx="${r.index}" role="button" tabindex="0">
        <div class="retrieval-rank__head">
          <span class="retrieval-rank__num">#${rank + 1}</span>
          <span class="retrieval-rank__score">${r.similarity.toFixed(3)}</span>
          ${retrieved ? '<span class="retrieval-rank__badge">Retrieved</span>' : ''}
          ${!passThreshold ? '<span class="retrieval-rank__badge retrieval-rank__badge--muted">Below threshold</span>' : ''}
        </div>
        <div class="retrieval-rank__bar"><span style="width:${barWidth}%"></span></div>
        <p class="retrieval-rank__text">${escapeHtml(r.text.slice(0, 100))}${r.text.length > 100 ? '…' : ''}</p>
      </div>`;
  }).join('');

  el.querySelectorAll('[data-inspect-idx]').forEach(row => {
    const handler = () => onSelect(parseInt(row.getAttribute('data-inspect-idx'), 10));
    row.addEventListener('click', handler);
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter') handler(); });
  });
}

function renderBreakdown(el, magEl, query, docText, vocab, documents) {
  if (!query.trim() || !docText) {
    el.innerHTML = '<p class="text-secondary">Select a chunk to see dot product breakdown.</p>';
    magEl.innerHTML = '';
    return;
  }

  const bp = dotProductBreakdown(query, docText, vocab, documents);
  const topRows = bp.rows.slice(0, 15);

  magEl.innerHTML = `
    <p class="retrieval-magnitudes__formula">
      cos θ = (query · chunk) / (‖query‖ × ‖chunk‖) =
      <code>${bp.dotSum.toFixed(4)}</code> / (<code>${bp.magQuery.toFixed(4)}</code> × <code>${bp.magDoc.toFixed(4)}</code>) =
      <strong>${bp.similarity.toFixed(4)}</strong>
    </p>`;

  el.innerHTML = `
    <table class="dot-product-table">
      <thead><tr><th>Term</th><th>Query</th><th>Chunk</th><th>Product</th></tr></thead>
      <tbody>
        ${topRows.map(r => `
          <tr>
            <td><code>${escapeHtml(r.term)}</code></td>
            <td>${r.queryWeight.toFixed(3)}</td>
            <td>${r.docWeight.toFixed(3)}</td>
            <td><strong>${r.product.toFixed(4)}</strong></td>
          </tr>`).join('')}
        <tr class="dot-product-table__sum"><td colspan="3">Dot product sum</td><td><strong>${bp.dotSum.toFixed(4)}</strong></td></tr>
      </tbody>
    </table>`;
}

function renderFormula(el, ranked, state) {
  const top = ranked[0];
  if (!top) { el.textContent = ''; return; }
  const passing = ranked.filter(r => r.similarity >= state.threshold);
  const retrieved = passing.slice(0, state.topK);
  el.innerHTML = `
    Top-${state.topK} above threshold ${state.threshold.toFixed(2)}: ${retrieved.map(r => `#${ranked.indexOf(r) + 1} (${r.similarity.toFixed(3)})`).join(', ') || 'none'}.
    ${top.similarity < 0.1 ? '<strong>Warning:</strong> Best score is very low — LLM will likely hallucinate without better context.' : ''}
    ${passing.length > state.topK ? ` ${passing.length - state.topK} chunk(s) above threshold but excluded by top-k.` : ''}`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;');
}
