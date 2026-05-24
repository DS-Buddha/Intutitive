/**
 * Full Pipeline Playground — chunk → embed → retrieve → assembled LLM prompt.
 */

import { on } from '../core/eventbus.js';
import {
  chunkFixed,
  chunkRecursive,
  buildVocabulary,
  toTfidfVector,
  cosineSimilarity,
} from '../core/text-math.js';

export function mount(container, config = {}) {
  const cfg = {
    sampleText: config.sampleText || '',
    defaultQuery: config.defaultQuery || 'What was Q3 revenue?',
    defaultTopK: config.defaultTopK || 3,
    defaultChunkSize: config.defaultChunkSize || 280,
    defaultOverlap: config.defaultOverlap || 20,
    defaultMode: config.defaultMode || 'recursive',
  };

  container.className = 'playground playground--pipeline';
  container.innerHTML = buildShell(cfg);

  const state = {
    text: cfg.sampleText,
    query: cfg.defaultQuery,
    topK: cfg.defaultTopK,
    chunkSize: cfg.defaultChunkSize,
    overlap: cfg.defaultOverlap,
    mode: cfg.defaultMode,
    syncedFromChunking: null,
  };

  const els = {
    text: container.querySelector('[data-pipe-text]'),
    query: container.querySelector('[data-pipe-query]'),
    topK: container.querySelector('[data-pipe-topk]'),
    topKVal: container.querySelector('[data-pipe-topk-val]'),
    size: container.querySelector('[data-pipe-size]'),
    overlap: container.querySelector('[data-pipe-overlap]'),
    modeBtns: container.querySelectorAll('[data-pipe-mode]'),
    syncBtn: container.querySelector('[data-pipe-sync]'),
    steps: container.querySelector('[data-pipe-steps]'),
    prompt: container.querySelector('[data-pipe-prompt]'),
    insights: container.querySelector('[data-pipe-insights]'),
  };

  on('playground:chunks-updated', (payload) => {
    state.syncedFromChunking = payload;
  });

  els.syncBtn.addEventListener('click', () => {
    if (state.syncedFromChunking) {
      state.text = state.syncedFromChunking.fullText || state.text;
      state.chunkSize = state.syncedFromChunking.chunkSize ?? state.chunkSize;
      state.overlap = state.syncedFromChunking.overlap ?? state.overlap;
      if (state.syncedFromChunking.mode) {
        state.mode = state.syncedFromChunking.mode;
        els.modeBtns.forEach(b => {
          b.setAttribute('aria-pressed', b.getAttribute('data-pipe-mode') === state.mode ? 'true' : 'false');
        });
      }
      els.text.value = state.text;
      els.size.value = state.chunkSize;
      els.overlap.value = state.overlap;
      render(state, els);
    }
  });

  els.text.addEventListener('input', () => render(state, els));
  els.query.addEventListener('input', () => render(state, els));
  els.topK.addEventListener('input', () => {
    state.topK = parseInt(els.topK.value, 10);
    els.topKVal.textContent = state.topK;
    render(state, els);
  });
  els.size.addEventListener('input', () => render(state, els));
  els.overlap.addEventListener('input', () => render(state, els));
  els.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode = btn.getAttribute('data-pipe-mode');
      els.modeBtns.forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      render(state, els);
    });
  });

  els.text.value = state.text;
  els.query.value = state.query;
  els.topKVal.textContent = state.topK;
  render(state, els);
}

function buildShell(cfg) {
  return `
    <div class="playground__header">
      <h3 class="playground__title">Full pipeline — put it together</h3>
      <p class="playground__subtitle">Run the complete baseline RAG flow: chunk document → embed → retrieve top-k → assemble the LLM prompt. Sync settings from the chunking sandbox above.</p>
    </div>

    <div class="playground__controls">
      <button type="button" class="btn-secondary playground-sync-btn" data-pipe-sync>Sync from chunking sandbox</button>
      <div class="playground__control-group">
        <span class="playground__label">Chunking</span>
        <div class="playground__toggle">
          <button type="button" class="playground__toggle-btn" data-pipe-mode="fixed" aria-pressed="${cfg.defaultMode === 'fixed'}">Fixed</button>
          <button type="button" class="playground__toggle-btn" data-pipe-mode="recursive" aria-pressed="${cfg.defaultMode === 'recursive'}">Recursive</button>
        </div>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Chunk size</label>
        <input type="range" data-pipe-size min="80" max="600" step="20" value="${cfg.defaultChunkSize}">
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Overlap %</label>
        <input type="range" data-pipe-overlap min="0" max="50" step="5" value="${cfg.defaultOverlap}">
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Top-k</label>
        <input type="range" data-pipe-topk min="1" max="5" step="1" value="${cfg.defaultTopK}">
        <span class="playground__value" data-pipe-topk-val>${cfg.defaultTopK}</span>
      </div>
    </div>

    <label class="playground__label">Document</label>
    <textarea class="playground__textarea" data-pipe-text rows="5"></textarea>

    <label class="playground__label">Query</label>
    <input type="text" class="playground__input" data-pipe-query placeholder="What was Q3 revenue?">

    <div class="pipeline-steps" data-pipe-steps></div>

    <div class="playground__panel">
      <span class="playground__label">Assembled LLM prompt — this is exactly what gets sent to the model</span>
      <pre class="pipeline-prompt" data-pipe-prompt></pre>
    </div>

    <ul class="pipeline-insights" data-pipe-insights></ul>
  `;
}

function render(state, els) {
  state.text = els.text.value;
  state.query = els.query.value;
  state.topK = parseInt(els.topK.value, 10);
  state.chunkSize = parseInt(els.size.value, 10);
  state.overlap = parseInt(els.overlap.value, 10);

  const chunkFn = state.mode === 'fixed' ? chunkFixed : chunkRecursive;
  const chunks = chunkFn(state.text, state.chunkSize, state.overlap);
  const docs = chunks.map(c => c.text);

  let ranked = [];
  if (state.query.trim() && docs.length) {
    const vocab = buildVocabulary([...docs, state.query]);
    const qVec = toTfidfVector(state.query, vocab, docs);
    ranked = chunks.map((c, i) => ({
      ...c,
      index: i,
      similarity: cosineSimilarity(qVec, toTfidfVector(c.text, vocab, docs)),
    })).sort((a, b) => b.similarity - a.similarity);
  }

  const retrieved = ranked.slice(0, state.topK);

  renderSteps(els.steps, chunks, retrieved, state.query);
  renderPrompt(els.prompt, retrieved, state.query);
  renderInsights(els.insights, chunks, ranked, retrieved, state.topK);
}

function renderSteps(el, chunks, retrieved, query) {
  el.innerHTML = `
    <div class="pipeline-step pipeline-step--done">
      <span class="pipeline-step__num">1</span>
      <div><strong>Chunk</strong> — ${chunks.length} piece(s) produced</div>
    </div>
    <div class="pipeline-step pipeline-step--done">
      <span class="pipeline-step__num">2</span>
      <div><strong>Embed</strong> — ${chunks.length} vector(s) in index</div>
    </div>
    <div class="pipeline-step pipeline-step--done">
      <span class="pipeline-step__num">3</span>
      <div><strong>Retrieve</strong> — top ${retrieved.length} for query "${escapeHtml(query.slice(0, 40))}${query.length > 40 ? '…' : ''}"</div>
    </div>
    <div class="pipeline-step__chunks">
      ${retrieved.map(r => `
        <div class="pipeline-step__chunk">
          <span class="pipeline-step__score">${r.similarity.toFixed(3)}</span>
          <span>${escapeHtml(r.text.slice(0, 80))}${r.text.length > 80 ? '…' : ''}</span>
        </div>`).join('') || '<p class="text-secondary">Enter a query to retrieve chunks.</p>'}
    </div>`;
}

function renderPrompt(el, retrieved, query) {
  if (!query.trim()) {
    el.textContent = 'Enter a query to see the assembled prompt.';
    return;
  }
  const context = retrieved.map(r => r.text).join('\n\n');
  el.textContent = `Given the following context:\n${context || '[no chunks retrieved]'}\n\nQuestion: ${query}\nAnswer:`;
}

function renderInsights(el, chunks, ranked, retrieved, topK) {
  const insights = [];

  chunks.forEach((c, i) => {
    const t = c.text.trim();
    if (t && !/[.!?"]$/.test(t)) {
      insights.push(`Chunk ${i + 1} ends mid-sentence — retrieval may miss context at boundaries.`);
    }
  });

  if (retrieved.length && retrieved[0].similarity < 0.1) {
    insights.push('Best similarity score is below 0.1 — the LLM will likely hallucinate without better matches.');
  }

  if (ranked.length > topK) {
    const next = ranked[topK];
    if (next && retrieved.length && next.similarity > retrieved[retrieved.length - 1].similarity * 0.9) {
      insights.push(`Rank #${topK + 1} scored ${next.similarity.toFixed(3)} — close to the cutoff. Try increasing top-k.`);
    }
  }

  if (retrieved.length === 0 && ranked.length) {
    insights.push('No chunks retrieved — check your query or corpus content.');
  }

  el.innerHTML = insights.length
    ? insights.map(s => `<li>${escapeHtml(s)}</li>`).join('')
    : '<li class="text-secondary">Pipeline looks healthy for this query.</li>';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
