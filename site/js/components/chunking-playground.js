/**
 * Chunking Playground — side-by-side compare, inline annotations, presets.
 */

import { emit } from '../core/eventbus.js';
import {
  chunkFixed,
  chunkRecursive,
  estimateTokens,
} from '../core/text-math.js';

const CHUNK_COLORS = [
  'var(--stage-ingest)',
  'var(--stage-index)',
  'var(--stage-retrieve)',
  'var(--stage-generate)',
  'var(--stage-verify)',
  'var(--color-accent-purple)',
  'var(--color-accent-orange)',
  'var(--color-accent-primary)',
];

const PRESETS = {
  earnings: {
    label: 'Earnings report',
    text: `Q3 2024 Earnings Summary

Our third-quarter revenue reached $4.8 billion, up 12% year-over-year. Cloud services drove most of the growth, while legacy hardware declined slightly.

Machine Learning Platform Update

We deployed a new embedding model for document retrieval. The model converts text chunks into 384-dimensional vectors. Retrieval latency improved by 40% after switching to approximate nearest-neighbor search.`,
  },
  ml: {
    label: 'ML platform doc',
    text: `Embedding models convert text into dense vectors. Each dimension captures some semantic feature learned during training. Similar texts produce vectors with high cosine similarity.

Vector databases store millions of these embeddings. At query time, the system embeds the user question and performs nearest-neighbor search to find relevant chunks.`,
  },
  trap: {
    label: 'Mid-sentence trap',
    text: 'The quick brown fox jumps over the lazy dog. Revenue was $4.8 billion in Q3. Machine learning models require large training datasets.',
  },
};

export function mount(container, config = {}) {
  const presets = { ...PRESETS, ...(config.presets || {}) };
  const cfg = {
    sampleText: config.sampleText || PRESETS.earnings.text,
    defaultChunkSize: config.defaultChunkSize || 280,
    defaultOverlap: config.defaultOverlap || 20,
  };

  container.className = 'playground playground--chunking';
  container.innerHTML = buildShell(cfg, presets);

  const state = {
    chunkSize: cfg.defaultChunkSize,
    overlap: cfg.defaultOverlap,
    text: cfg.sampleText,
    highlightIdx: null,
    viewMode: 'compare',
  };

  const els = {
    textarea: container.querySelector('[data-chunk-text]'),
    preset: container.querySelector('[data-chunk-preset]'),
    size: container.querySelector('[data-chunk-size]'),
    sizeVal: container.querySelector('[data-chunk-size-val]'),
    overlap: container.querySelector('[data-chunk-overlap]'),
    overlapVal: container.querySelector('[data-chunk-overlap-val]'),
    compareGrid: container.querySelector('[data-chunk-compare-grid]'),
    inline: container.querySelector('[data-chunk-inline]'),
    stats: container.querySelector('[data-chunk-stats]'),
    insight: container.querySelector('[data-chunk-insight]'),
    viewBtns: container.querySelectorAll('[data-chunk-view]'),
  };

  els.textarea.value = state.text;

  const render = () => {
    state.text = els.textarea.value;
    const fixedChunks = chunkFixed(state.text, state.chunkSize, state.overlap);
    const recursiveChunks = chunkRecursive(state.text, state.chunkSize, state.overlap);
    const activeChunks = state.viewMode === 'fixed' ? fixedChunks : recursiveChunks;

    renderCompareGrid(els.compareGrid, state.text, fixedChunks, recursiveChunks, state.highlightIdx);
    renderInline(els.inline, state.text, activeChunks, state.viewMode, state.highlightIdx);
    renderStats(els.stats, fixedChunks, recursiveChunks);
    renderInsight(els.insight, fixedChunks, recursiveChunks);

    emit('playground:chunks-updated', {
      chunks: recursiveChunks,
      texts: recursiveChunks.map(c => c.text),
      fullText: state.text,
      chunkSize: state.chunkSize,
      overlap: state.overlap,
      mode: state.viewMode,
    });
  };

  const setHighlight = (idx) => {
    state.highlightIdx = idx;
    container.querySelectorAll('[data-chunk-idx]').forEach(el => {
      el.classList.toggle('chunk-highlight', parseInt(el.getAttribute('data-chunk-idx'), 10) === idx);
    });
    container.querySelectorAll('[data-inline-chunk]').forEach(el => {
      el.classList.toggle('chunk-inline__span--active', parseInt(el.getAttribute('data-inline-chunk'), 10) === idx);
    });
  };

  els.textarea.addEventListener('input', () => { state.highlightIdx = null; render(); });
  els.preset.addEventListener('change', () => {
    const key = els.preset.value;
    if (presets[key]) {
      els.textarea.value = presets[key].text;
      render();
    }
  });
  els.size.addEventListener('input', () => {
    state.chunkSize = parseInt(els.size.value, 10);
    els.sizeVal.textContent = `${state.chunkSize} chars (~${estimateTokens('x'.repeat(state.chunkSize))} tokens)`;
    render();
  });
  els.overlap.addEventListener('input', () => {
    state.overlap = parseInt(els.overlap.value, 10);
    els.overlapVal.textContent = `${state.overlap}%`;
    render();
  });

  els.viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.viewMode = btn.getAttribute('data-chunk-view');
      els.viewBtns.forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      render();
    });
  });

  container.addEventListener('mouseover', (e) => {
    const idx = e.target.closest('[data-chunk-idx]')?.getAttribute('data-chunk-idx');
    if (idx != null) setHighlight(parseInt(idx, 10));
  });
  container.addEventListener('mouseleave', (e) => {
    if (!e.relatedTarget || !container.contains(e.relatedTarget)) {
      state.highlightIdx = null;
      container.querySelectorAll('.chunk-highlight, .chunk-inline__span--active').forEach(el => {
        el.classList.remove('chunk-highlight', 'chunk-inline__span--active');
      });
    }
  });

  els.sizeVal.textContent = `${state.chunkSize} chars (~${estimateTokens('x'.repeat(state.chunkSize))} tokens)`;
  els.overlapVal.textContent = `${state.overlap}%`;
  render();
}

function buildShell(cfg, presets) {
  const presetOptions = Object.entries(presets)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
    .join('');

  return `
    <div class="playground__header">
      <h3 class="playground__title">Chunking sandbox</h3>
      <p class="playground__subtitle">Edit the document and watch fixed vs recursive splits side-by-side. Hover any chunk to highlight it in the annotated view.</p>
    </div>

    <div class="playground__controls">
      <div class="playground__control-group">
        <label class="playground__label" for="chunk-preset">Sample document</label>
        <select id="chunk-preset" class="playground__select" data-chunk-preset>${presetOptions}</select>
      </div>
      <div class="playground__control-group">
        <label class="playground__label" for="chunk-size">Max chunk size</label>
        <input type="range" id="chunk-size" data-chunk-size min="80" max="600" step="20" value="${cfg.defaultChunkSize}">
        <span class="playground__value" data-chunk-size-val></span>
      </div>
      <div class="playground__control-group">
        <label class="playground__label" for="chunk-overlap">Overlap</label>
        <input type="range" id="chunk-overlap" data-chunk-overlap min="0" max="50" step="5" value="${cfg.defaultOverlap}">
        <span class="playground__value" data-chunk-overlap-val></span>
      </div>
      <div class="playground__control-group">
        <span class="playground__label">Inline view shows</span>
        <div class="playground__toggle" role="group">
          <button type="button" class="playground__toggle-btn" data-chunk-view="fixed" aria-pressed="false">Fixed</button>
          <button type="button" class="playground__toggle-btn" data-chunk-view="recursive" aria-pressed="true">Recursive</button>
        </div>
      </div>
    </div>

    <label class="playground__label" for="chunk-doc">Your document</label>
    <textarea class="playground__textarea" id="chunk-doc" data-chunk-text rows="6"></textarea>

    <div class="playground__panel">
      <span class="playground__label">Side-by-side split maps</span>
      <div class="chunk-compare-grid" data-chunk-compare-grid></div>
    </div>

    <div class="playground__panel">
      <span class="playground__label">Annotated document — colored spans show chunk boundaries, | marks cuts</span>
      <div class="chunk-inline" data-chunk-inline></div>
    </div>

    <p class="playground__insight" data-chunk-insight></p>
    <p class="playground__stats text-secondary" data-chunk-stats></p>
  `;
}

function renderCompareGrid(el, text, fixedChunks, recursiveChunks, highlightIdx) {
  if (!text.length) {
    el.innerHTML = '<p class="text-secondary">Add text to see splits.</p>';
    return;
  }

  el.innerHTML = `
    <div class="chunk-compare-col">
      <h4 class="chunk-compare-col__title">Fixed (rigid) — ${fixedChunks.length} chunks</h4>
      ${renderMapBar(text, fixedChunks, 'fixed', highlightIdx)}
      ${renderMiniBlocks(fixedChunks, 'fixed', highlightIdx)}
    </div>
    <div class="chunk-compare-col">
      <h4 class="chunk-compare-col__title">Recursive — ${recursiveChunks.length} chunks</h4>
      ${renderMapBar(text, recursiveChunks, 'recursive', highlightIdx)}
      ${renderMiniBlocks(recursiveChunks, 'recursive', highlightIdx)}
    </div>
  `;
}

function renderMapBar(text, chunks, mode, highlightIdx) {
  const len = text.length;
  const segs = chunks.map((c, i) => {
    const left = (c.start / len) * 100;
    const width = ((c.end - c.start) / len) * 100;
    const color = CHUNK_COLORS[i % CHUNK_COLORS.length];
    const hi = highlightIdx === i ? ' chunk-map__seg--active' : '';
    return `<span class="chunk-map__seg${hi}" data-chunk-idx="${i}" data-chunk-mode="${mode}"
      style="left:${left}%;width:${width}%;background:${color}"
      title="Chunk ${i + 1}: ${c.start}–${c.end}"></span>`;
  }).join('');
  return `<div class="chunk-map">${segs}<div class="chunk-map__ruler"><span>0</span><span>${len}</span></div></div>`;
}

function renderMiniBlocks(chunks, mode, highlightIdx) {
  return `<div class="chunk-blocks chunk-blocks--compact">${chunks.map((c, i) => {
    const color = CHUNK_COLORS[i % CHUNK_COLORS.length];
    const hi = highlightIdx === i ? ' chunk-block--active' : '';
    return `
      <article class="chunk-block${hi}" data-chunk-idx="${i}" data-chunk-mode="${mode}" style="border-left-color:${color}">
        <header class="chunk-block__head">
          <span class="chunk-block__idx" style="background:${color}">${i + 1}</span>
          <span class="chunk-block__meta">${c.text.length} chars · ${c.splitAt}${c.overlapWithPrev ? ` · overlap ${c.overlapWithPrev}` : ''}</span>
        </header>
        <p class="chunk-block__text">${escapeHtml(c.text.slice(0, 100))}${c.text.length > 100 ? '…' : ''}</p>
      </article>`;
  }).join('')}</div>`;
}

function renderInline(el, text, chunks, mode, highlightIdx) {
  if (!text.length || chunks.length === 0) {
    el.innerHTML = '<p class="text-secondary">No chunks to display.</p>';
    return;
  }

  let html = '';
  let pos = 0;

  chunks.forEach((c, i) => {
    if (c.start > pos) {
      html += escapeHtml(text.slice(pos, c.start));
    }
    if (i > 0) {
      html += `<span class="chunk-inline__cut" title="Split: ${c.splitAt}">|</span>`;
    }
    const color = CHUNK_COLORS[i % CHUNK_COLORS.length];
    const active = highlightIdx === i ? ' chunk-inline__span--active' : '';
    const overlapClass = c.overlapWithPrev ? ' chunk-inline__span--overlap' : '';
    html += `<span class="chunk-inline__span${active}${overlapClass}" data-inline-chunk="${i}"
      style="background-color:color-mix(in srgb, ${color} 25%, transparent);border-bottom:2px solid ${color}"
      title="Chunk ${i + 1}">${escapeHtml(text.slice(c.start, c.end))}</span>`;
    pos = c.end;
  });

  if (pos < text.length) {
    html += escapeHtml(text.slice(pos));
  }

  el.innerHTML = `<div class="chunk-inline__doc">${html}</div>`;
}

function renderStats(el, fixed, recursive) {
  const midFixed = countMidSentence(fixed);
  const midRec = countMidSentence(recursive);
  el.textContent = `Fixed: ${fixed.length} chunks (${midFixed} mid-sentence) · Recursive: ${recursive.length} chunks (${midRec} mid-sentence)`;
}

function renderInsight(el, fixed, recursive) {
  const diff = fixed.length - recursive.length;
  el.textContent = diff > 0
    ? `Recursive produced ${Math.abs(diff)} fewer chunk(s) at the same size — natural boundaries avoid redundant splits. Shrink chunk size to see fixed mode cut mid-sentence.`
    : `At this size, both strategies produce similar chunk counts. Try the "Mid-sentence trap" preset with chunk size ~80.`;
}

function countMidSentence(chunks) {
  return chunks.filter(c => {
    const t = c.text.trim();
    return t.length > 0 && !/[.!?"]$/.test(t);
  }).length;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
