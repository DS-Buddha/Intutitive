/**
 * Evidence pins — link chunks to regions on a mock PDF page.
 */

export function mount(container, config = {}) {
  const regions = config.regions || [];
  container.className = 'playground playground--evidence';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Evidence pins sandbox</h3>
      <p class="playground__subtitle">Click a chunk — see the exact source region it came from. Citations become "show me where," not "trust me."</p>
    </div>
    <div class="evidence-layout">
      <div class="playground__panel">
        <span class="playground__label">Mock PDF page</span>
        <div class="evidence-page" data-evidence-page></div>
      </div>
      <div class="playground__panel">
        <span class="playground__label">Retrieved chunks</span>
        <div class="evidence-chunks" data-evidence-chunks></div>
      </div>
    </div>
  `;

  const page = container.querySelector('[data-evidence-page]');
  const chunksEl = container.querySelector('[data-evidence-chunks]');
  let active = 0;

  page.innerHTML = regions.map((r, i) => `
    <div class="evidence-region" data-region="${i}" style="top:${r.top}%;left:${r.left}%;width:${r.width}%;height:${r.height}%;"
      title="Page ${r.page || 1}">
      <span class="evidence-region__tag">${i + 1}</span>
    </div>
  `).join('');

  const highlight = (idx) => {
    active = idx;
    page.querySelectorAll('.evidence-region').forEach(el => {
      el.classList.toggle('evidence-region--active', parseInt(el.getAttribute('data-region'), 10) === idx);
    });
    chunksEl.querySelectorAll('.evidence-chunk').forEach(el => {
      el.classList.toggle('evidence-chunk--active', parseInt(el.getAttribute('data-chunk'), 10) === idx);
    });
  };

  chunksEl.innerHTML = regions.map((r, i) => `
    <button type="button" class="evidence-chunk" data-chunk="${i}">
      <span class="evidence-chunk__meta">Chunk ${i + 1} · p.${r.page || 1} · ${r.type || 'text'}</span>
      <span class="evidence-chunk__text">${escapeHtml(r.text)}</span>
    </button>
  `).join('');

  chunksEl.querySelectorAll('.evidence-chunk').forEach(btn => {
    btn.addEventListener('click', () => highlight(parseInt(btn.getAttribute('data-chunk'), 10)));
  });
  page.querySelectorAll('.evidence-region').forEach(el => {
    el.addEventListener('click', () => highlight(parseInt(el.getAttribute('data-region'), 10)));
  });

  highlight(0);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
