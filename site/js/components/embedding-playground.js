/**
 * Embedding Playground — text to TF-IDF vector heatmap.
 */

import { on } from '../core/eventbus.js';
import {
  buildVocabulary,
  toTfidfVector,
  vectorMagnitude,
  vectorSparsity,
  topVectorDimensions,
} from '../core/text-math.js';

export function mount(container, config = {}) {
  container.className = 'playground playground--embedding';
  container.innerHTML = buildShell();

  const state = {
    text: config.defaultText || '',
    pipedChunks: [],
    selectedChunkIdx: 0,
  };

  const els = {
    text: container.querySelector('[data-embed-text]'),
    chunkSelect: container.querySelector('[data-embed-chunk-select]'),
    chunkRow: container.querySelector('[data-embed-chunk-row]'),
    heatmap: container.querySelector('[data-embed-heatmap]'),
    summary: container.querySelector('[data-embed-summary]'),
  };

  on('playground:chunks-updated', ({ texts }) => {
    state.pipedChunks = texts || [];
    updateChunkSelect(els, state);
    if (state.pipedChunks.length > 0 && !els.text.value.trim()) {
      state.selectedChunkIdx = 0;
      els.text.value = state.pipedChunks[0];
      els.chunkSelect.value = '0';
      render(els, state);
    }
  });

  els.text.addEventListener('input', () => render(els, state));
  els.chunkSelect.addEventListener('change', () => {
    const idx = parseInt(els.chunkSelect.value, 10);
    if (!isNaN(idx) && state.pipedChunks[idx]) {
      state.selectedChunkIdx = idx;
      els.text.value = state.pipedChunks[idx];
      render(els, state);
    }
  });

  if (state.text) els.text.value = state.text;
  render(els, state);
}

function buildShell() {
  return `
    <div class="playground__header">
      <h3 class="playground__title">Embedding sandbox</h3>
      <p class="playground__subtitle">See how text becomes a numerical vector. Uses TF-IDF here for transparency — real embedders use 384–1536 learned dimensions, but cosine similarity works the same way.</p>
    </div>

    <div class="playground__controls" data-embed-chunk-row style="display:none;">
      <div class="playground__control-group playground__control-group--wide">
        <label class="playground__label" for="embed-chunk">Chunk from chunking sandbox</label>
        <select id="embed-chunk" class="playground__select" data-embed-chunk-select></select>
      </div>
    </div>

    <label class="playground__label" for="embed-text">Text to embed</label>
    <textarea class="playground__textarea" id="embed-text" data-embed-text rows="4"
      placeholder="Type text or select a chunk from the chunking sandbox above…"></textarea>

    <div class="playground__panel">
      <span class="playground__label">Vector heatmap — top non-zero dimensions</span>
      <div class="vector-heatmap" data-embed-heatmap></div>
    </div>

    <div class="playground__stats" data-embed-summary></div>
  `;
}

function updateChunkSelect(els, state) {
  if (state.pipedChunks.length === 0) {
    els.chunkRow.style.display = 'none';
    return;
  }
  els.chunkRow.style.display = 'flex';
  els.chunkSelect.innerHTML = state.pipedChunks.map((t, i) =>
    `<option value="${i}">Chunk ${i + 1}: ${t.slice(0, 50)}${t.length > 50 ? '…' : ''}</option>`
  ).join('');
}

function render(els, state) {
  const text = els.text.value.trim();
  if (!text) {
    els.heatmap.innerHTML = '<p class="text-secondary">Enter text to see its vector.</p>';
    els.summary.textContent = '';
    return;
  }

  const docs = state.pipedChunks.length ? state.pipedChunks : [text];
  const vocab = buildVocabulary(docs);
  const vec = toTfidfVector(text, vocab, docs);
  const top = topVectorDimensions(vec, vocab, 20);
  const maxW = top[0]?.weight || 1;

  els.heatmap.innerHTML = top.length === 0
    ? '<p class="text-secondary">No terms found.</p>'
    : top.map(d => `
      <div class="vector-heatmap__row">
        <span class="vector-heatmap__term">${escapeHtml(d.term)}</span>
        <div class="vector-heatmap__bar-track">
          <span class="vector-heatmap__bar" style="width:${(d.weight / maxW) * 100}%"></span>
        </div>
        <span class="vector-heatmap__val">${d.weight.toFixed(3)}</span>
      </div>
    `).join('');

  const mag = vectorMagnitude(vec);
  const sparsity = vectorSparsity(vec);
  els.summary.innerHTML = `
    <strong>${vocab.length}</strong> dimensions in vocabulary ·
    <strong>${top.length}</strong> non-zero in this text ·
    L2 magnitude <code>‖v‖ = ${mag.toFixed(3)}</code> ·
    ${sparsity}% sparse
  `;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
