/**
 * Resolution zoom — knob to see document vs line vs span access.
 */

import { labChunks } from '../topics/papers/dci-agent/dci-scenarios.js';

export function mount(container, config = {}) {
  const doc = config.document || labChunks.find(c => c.id === 'c3');

  container.className = 'playground playground--resolution';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Interface resolution</h3>
      <p class="playground__subtitle">Drag the slider from whole document down to exact line. This is what "higher resolution" means in the paper.</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group playground__control-group--wide">
        <label class="playground__label">Resolution level: <span class="playground__value" data-res-label>Line</span></label>
        <input type="range" min="0" max="3" value="2" data-res-slider>
        <div class="res-ticks"><span>Document</span><span>Passage</span><span>Line</span><span>Span</span></div>
      </div>
    </div>
    <div class="res-doc-view" data-res-view></div>
    <p class="playground__insight" data-res-insight></p>
  `;

  const labels = ['Document', 'Passage', 'Line', 'Span'];
  const insights = [
    'Retriever often returns a whole chunk — agent sees ~512 tokens, much of it irrelevant.',
    'Passage-level: a retrieved snippet — better, but boundaries are fixed by chunking.',
    'Line-level: grep returns exact matching lines with line numbers — DCI default.',
    'Span-level: read surrounding context around match — precise citation for verification.',
  ];

  const slider = container.querySelector('[data-res-slider]');
  const view = container.querySelector('[data-res-view]');
  const label = container.querySelector('[data-res-label]');
  const insight = container.querySelector('[data-res-insight]');

  const fullDoc = labChunks.filter(c => c.file === doc.file).map(c => c.text).join('\n');
  const targetLine = doc.text;

  const render = () => {
    const level = parseInt(slider.value, 10);
    label.textContent = labels[level];
    insight.textContent = insights[level];

    let content = '';
    if (level === 0) {
      content = `<div class="res-block res-block--dim">${escapeHtml(fullDoc)}</div>`;
    } else if (level === 1) {
      content = `<div class="res-block">${escapeHtml(fullDoc.slice(0, 180))}…</div>`;
    } else if (level === 2) {
      content = `<div class="res-block res-block--highlight">${escapeHtml(targetLine)}</div>
        <p class="res-meta">${doc.file}:${doc.line}</p>`;
    } else {
      const words = targetLine.split(' ');
      const span = words.slice(1, 4).join(' ');
      content = `<div class="res-block">${escapeHtml(targetLine.replace(span, ''))}<mark>${escapeHtml(span)}</mark>${escapeHtml(targetLine.split(span)[1] || '')}</div>
        <p class="res-meta">Exact span highlighted · ${doc.file}:${doc.line}</p>`;
    }
    view.innerHTML = content;
  };

  slider.addEventListener('input', render);
  render();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
