/**
 * Naive vs layout-aware parsing — see reading order and chunk quality change.
 */

export function mount(container, config = {}) {
  const blocks = config.blocks || [];
  container.className = 'playground playground--parse';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Parsing sandbox</h3>
      <p class="playground__subtitle">Toggle naive text extraction vs layout-aware parsing. Watch how chunk text changes when reading order is preserved.</p>
    </div>
    <div class="playground__controls">
      <div class="playground__toggle" role="group">
        <button type="button" class="playground__toggle-btn" data-mode="naive" aria-pressed="false">Naive extract</button>
        <button type="button" class="playground__toggle-btn" data-mode="layout" aria-pressed="true">Layout-aware</button>
      </div>
    </div>
    <div class="parse-layout">
      <div class="playground__panel">
        <span class="playground__label">Document layout (mock PDF page)</span>
        <div class="parse-page" data-parse-page></div>
      </div>
      <div class="playground__panel">
        <span class="playground__label">Extracted reading order → chunk preview</span>
        <div class="parse-output" data-parse-output></div>
      </div>
    </div>
    <p class="playground__insight" data-parse-insight></p>
  `;

  const state = { mode: 'layout', blocks };
  const page = container.querySelector('[data-parse-page]');
  const output = container.querySelector('[data-parse-output]');
  const insight = container.querySelector('[data-parse-insight]');

  const render = () => {
    const order = state.mode === 'naive'
      ? [...state.blocks].sort((a, b) => a.naiveOrder - b.naiveOrder)
      : [...state.blocks].sort((a, b) => a.layoutOrder - b.layoutOrder);

    page.innerHTML = state.blocks.map(b => `
      <div class="parse-block" style="grid-column:${b.col};grid-row:${b.row}"
        data-id="${b.id}" title="${b.type}">${escapeHtml(b.label)}</div>
    `).join('');

    const merged = order.map(b => b.text).join(' ');
    const chunkPreview = merged.slice(0, config.chunkPreviewLen || 220);

    output.innerHTML = `
      <ol class="parse-order-list">${order.map(b => `<li><strong>${b.type}</strong>: ${escapeHtml(b.text)}</li>`).join('')}</ol>
      <div class="parse-chunk-preview">
        <span class="playground__label">Resulting chunk (first ${config.chunkPreviewLen || 220} chars)</span>
        <p>${escapeHtml(chunkPreview)}${merged.length > (config.chunkPreviewLen || 220) ? '…' : ''}</p>
      </div>`;

    insight.textContent = state.mode === 'naive'
      ? 'Naive extraction mixed columns — revenue figure separated from its context. Retrieval will match wrong passages.'
      : 'Layout-aware order keeps heading with its paragraph — chunk is coherent for embedding and retrieval.';
  };

  container.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode = btn.getAttribute('data-mode');
      container.querySelectorAll('[data-mode]').forEach(b =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      render();
    });
  });

  render();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
