/**
 * Resolution zoom — knob to see document vs line vs span access.
 */

import { mergeLabels, RESOLUTION_LABELS } from './playground-labels.js';

export function mount(container, config = {}) {
  const doc = config.document;
  const chunks = config.chunks || [];
  const labels = mergeLabels(RESOLUTION_LABELS, config.labels);
  const levelNames = labels.levelNames;
  const tickLabels = labels.tickLabels || levelNames;
  const insights = labels.insights;

  if (!doc) {
    container.textContent = 'Resolution playground requires config.document in lab-data.js';
    return;
  }

  const maxLevel = levelNames.length - 1;

  container.className = 'playground playground--resolution';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">${labels.title}</h3>
      <p class="playground__subtitle">${labels.subtitle}</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group playground__control-group--wide">
        <label class="playground__label">Resolution level: <span class="playground__value" data-res-label>${levelNames[2] || levelNames[0]}</span></label>
        <input type="range" min="0" max="${maxLevel}" value="${Math.min(2, maxLevel)}" data-res-slider>
        <div class="res-ticks">${tickLabels.map(t => `<span>${t}</span>`).join('')}</div>
      </div>
    </div>
    <div class="res-doc-view" data-res-view></div>
    <p class="playground__insight" data-res-insight></p>
  `;

  const slider = container.querySelector('[data-res-slider]');
  const view = container.querySelector('[data-res-view]');
  const label = container.querySelector('[data-res-label]');
  const insight = container.querySelector('[data-res-insight]');

  const fullDoc = chunks.filter(c => c.file === doc.file).map(c => c.text).join('\n') || doc.text;
  const targetLine = doc.text;

  const render = () => {
    const level = parseInt(slider.value, 10);
    label.textContent = levelNames[level];
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
