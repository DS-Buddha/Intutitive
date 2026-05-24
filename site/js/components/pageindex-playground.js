/**
 * PageIndex — TOC navigation vs flat chunk search on structured docs.
 */

export function mount(container, config = {}) {
  const sections = config.sections || [];
  const flatChunks = config.flatChunks || [];
  container.className = 'playground playground--pageindex';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">PageIndex sandbox</h3>
      <p class="playground__subtitle">Structured docs have a table of contents. Navigate by section instead of hoping flat search finds the right page.</p>
    </div>
    <input type="text" class="playground__input" data-pageindex-query>
    <div class="pageindex-layout">
      <div class="playground__panel">
        <span class="playground__label">TOC navigation</span>
        <div class="pageindex-toc" data-pageindex-toc></div>
        <div class="pageindex-section-preview" data-pageindex-preview></div>
      </div>
      <div class="playground__panel">
        <span class="playground__label">Flat chunk search (baseline)</span>
        <div data-pageindex-flat></div>
      </div>
    </div>
  `;

  const queryInput = container.querySelector('[data-pageindex-query]');
  const tocEl = container.querySelector('[data-pageindex-toc]');
  const previewEl = container.querySelector('[data-pageindex-preview]');
  const flatEl = container.querySelector('[data-pageindex-flat]');
  queryInput.value = config.defaultQuery || '';

  const score = (text, q) => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const t = text.toLowerCase();
    return terms.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
  };

  const render = () => {
    const q = queryInput.value;
    const rankedSections = [...sections].map(s => ({ ...s, score: score(s.title + ' ' + s.summary, q) }))
      .sort((a, b) => b.score - a.score);
    const rankedFlat = [...flatChunks].map(c => ({ ...c, score: score(c.text, q) }))
      .sort((a, b) => b.score - a.score);

    tocEl.innerHTML = sections.map(s => {
      const active = rankedSections[0]?.id === s.id && q.length > 0;
      return `<button type="button" class="pageindex-toc-item ${active ? 'pageindex-toc-item--active' : ''}" data-section="${s.id}">
        <span>${s.title}</span><small>p.${s.page}</small>
      </button>`;
    }).join('');

    const top = rankedSections[0];
    previewEl.innerHTML = top && q
      ? `<strong>${top.title}</strong><p>${top.summary}</p><span class="playground__meta">Jumped directly to section · score ${top.score}</span>`
      : '<p class="playground__hint">Enter a query — TOC picks the right section in one hop.</p>';

    flatEl.innerHTML = rankedFlat.slice(0, 4).map((c, i) =>
      `<div class="pageindex-flat-chunk"><span>#${i + 1}</span><span>${c.label}</span><code>${c.score}</code><p>${c.text.slice(0, 80)}…</p></div>`
    ).join('') || '<p class="playground__hint">Flat search may return fragments from wrong sections.</p>';
  };

  queryInput.addEventListener('input', render);
  render();
}
