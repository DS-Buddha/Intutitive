/**
 * GraphRAG — entity graph with community-level retrieval.
 */

export function mount(container, config = {}) {
  const entities = config.entities || [];
  const edges = config.edges || [];
  const communities = config.communities || [];
  container.className = 'playground playground--graphrag';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">GraphRAG sandbox</h3>
      <p class="playground__subtitle">Extract entities → build graph → summarize communities. Global questions hit community summaries, not random chunks.</p>
    </div>
    <input type="text" class="playground__input" data-graph-query placeholder="Try: What themes connect our product lines?">
    <div class="graphrag-layout">
      <div class="playground__panel">
        <span class="playground__label">Entity graph</span>
        <svg class="graphrag-svg" data-graph-svg viewBox="0 0 400 280"></svg>
      </div>
      <div class="playground__panel">
        <span class="playground__label">Matched community summary</span>
        <div data-graph-community></div>
        <span class="playground__label">Related entities</span>
        <div data-graph-entities></div>
      </div>
    </div>
  `;

  const queryInput = container.querySelector('[data-graph-query]');
  const svg = container.querySelector('[data-graph-svg]');
  const communityEl = container.querySelector('[data-graph-community]');
  const entitiesEl = container.querySelector('[data-graph-entities]');
  queryInput.value = config.defaultQuery || '';

  const positions = {};
  entities.forEach((e, i) => {
    const angle = (i / entities.length) * Math.PI * 2;
    positions[e.id] = { x: 200 + Math.cos(angle) * 120, y: 140 + Math.sin(angle) * 90 };
  });

  const renderGraph = (highlightIds = new Set()) => {
    const edgeLines = edges.map(e =>
      `<line x1="${positions[e.from].x}" y1="${positions[e.from].y}" x2="${positions[e.to].x}" y2="${positions[e.to].y}" class="graphrag-edge"/>`
    ).join('');
    const nodes = entities.map(e => {
      const p = positions[e.id];
      const active = highlightIds.has(e.id);
      return `<g class="graphrag-node ${active ? 'graphrag-node--active' : ''}">
        <circle cx="${p.x}" cy="${p.y}" r="22"/>
        <text x="${p.x}" y="${p.y + 4}" text-anchor="middle">${e.label.slice(0, 8)}</text>
      </g>`;
    }).join('');
    svg.innerHTML = edgeLines + nodes;
  };

  const render = () => {
    const q = queryInput.value.toLowerCase();
    const scored = communities.map(c => ({
      ...c,
      score: (c.summary + ' ' + c.keywords.join(' ')).toLowerCase().split(/\s+/).filter(w => q.includes(w) || w.includes(q.split(' ')[0] || '')).length,
    })).sort((a, b) => b.score - a.score);

    const top = scored[0];
    const related = top ? entities.filter(e => top.entityIds.includes(e.id)) : [];
    renderGraph(new Set(related.map(e => e.id)));

    communityEl.innerHTML = top && q
      ? `<div class="callout"><strong>${top.name}</strong><p>${top.summary}</p></div>`
      : '<p class="playground__hint">Ask a global question to retrieve a community summary.</p>';

    entitiesEl.innerHTML = related.map(e =>
      `<span class="graphrag-entity-tag">${e.label}</span>`
    ).join('') || '<p class="playground__hint">Entities in matched community appear here.</p>';
  };

  queryInput.addEventListener('input', render);
  renderGraph();
  render();
}
