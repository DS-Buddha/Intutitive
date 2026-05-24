/**
 * RAPTOR — hierarchical summary tree with multi-level retrieval.
 */

export function mount(container, config = {}) {
  const tree = config.tree || { label: 'Root', children: [] };
  container.className = 'playground playground--raptor';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">RAPTOR tree sandbox</h3>
      <p class="playground__subtitle">Retrieve at leaf (precise) or summary (broad) level. Tree summaries collapse many chunks into navigable layers.</p>
    </div>
    <input type="text" class="playground__input" data-raptor-query placeholder="Query the tree">
    <div class="raptor-layout">
      <div class="playground__panel">
        <span class="playground__label">Summary tree</span>
        <div class="raptor-tree" data-raptor-tree></div>
      </div>
      <div class="playground__panel">
        <span class="playground__label">Matched nodes (by level)</span>
        <div data-raptor-matches></div>
      </div>
    </div>
  `;

  const queryInput = container.querySelector('[data-raptor-query]');
  const treeEl = container.querySelector('[data-raptor-tree]');
  const matchesEl = container.querySelector('[data-raptor-matches]');
  queryInput.value = config.defaultQuery || '';

  const flatten = (node, level = 0, path = []) => {
    const items = [{ node, level, path: [...path, node.label] }];
    (node.children || []).forEach(c => items.push(...flatten(c, level + 1, [...path, node.label])));
    return items;
  };

  const renderTree = (node, depth = 0) => `
    <div class="raptor-node" style="margin-left:${depth * 16}px" data-node-id="${node.id || node.label}">
      <span class="raptor-node__level">L${depth}</span>
      <strong>${node.label}</strong>
      ${node.summary ? `<p class="raptor-node__summary">${node.summary}</p>` : ''}
      ${(node.children || []).map(c => renderTree(c, depth + 1)).join('')}
    </div>`;

  const score = (text, query) => {
    const q = query.toLowerCase().split(/\s+/).filter(Boolean);
    const t = text.toLowerCase();
    return q.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0) / Math.max(q.length, 1);
  };

  const render = () => {
    const q = queryInput.value;
    treeEl.innerHTML = renderTree(tree);
    const all = flatten(tree);
    const matched = all.map(({ node, level, path }) => ({
      level, path: path.join(' → '),
      label: node.label,
      text: node.summary || node.text || node.label,
      score: score((node.summary || node.text || node.label) + ' ' + node.label, q),
    })).filter(m => m.score > 0).sort((a, b) => b.score - a.score || a.level - b.level);

    matchesEl.innerHTML = matched.length
      ? matched.slice(0, 6).map((m, i) =>
        `<div class="raptor-match"><span>#${i + 1} L${m.level}</span><strong>${m.label}</strong><span>${m.path}</span><code>${m.score.toFixed(2)}</code></div>`
      ).join('')
      : '<p class="playground__hint">Type a query to see which tree level answers best.</p>';
  };

  queryInput.addEventListener('input', render);
  render();
}
