/**
 * AutoWebGLM lab scenarios — web page elements as ranked candidates.
 */

export const labChunks = [
  { id: 'e1', label: 'Search input', text: '<input id="12" placeholder="Search products…">', file: 'shop.html', line: 42, scoreSemantic: 0.91, scoreKeyword: 0.88, isGold: { search: true } },
  { id: 'e2', label: 'Search button', text: '<button id="13">Search</button>', file: 'shop.html', line: 43, scoreSemantic: 0.85, scoreKeyword: 0.95, isGold: { search: true } },
  { id: 'e3', label: 'Add to cart', text: '<button id="47" class="primary">Add to Cart</button>', file: 'product.html', line: 18, scoreSemantic: 0.78, scoreKeyword: 0.35, isGold: { cart: true, checkout: true } },
  { id: 'e4', label: 'Cookie banner', text: '<div id="2" class="cookie-notice">Accept cookies…</div>', file: 'shop.html', line: 3, scoreSemantic: 0.72, scoreKeyword: 0.82 },
  { id: 'e5', label: 'Footer newsletter', text: '<input id="99" placeholder="Subscribe to newsletter">', file: 'shop.html', line: 120, scoreSemantic: 0.55, scoreKeyword: 0.40 },
  { id: 'e6', label: 'Checkout CTA', text: '<a id="51" href="/checkout">Proceed to Checkout</a>', file: 'cart.html', line: 8, scoreSemantic: 0.82, scoreKeyword: 0.70, isGold: { checkout: true } },
  { id: 'e7', label: 'Price filter', text: '<select id="28"><option>Under $50</option></select>', file: 'shop.html', line: 55, scoreSemantic: 0.68, scoreKeyword: 0.45, isGold: { filter: true } },
  { id: 'e8', label: 'Nav logo', text: '<img id="1" alt="Store logo" src="/logo.png">', file: 'shop.html', line: 1, scoreSemantic: 0.40, scoreKeyword: 0.15 },
];

export const labScenarios = [
  {
    id: 'search',
    label: 'Find search box',
    question: 'Search for "wireless headphones" on this shop page.',
    scoreKey: 'scoreKeyword',
    goldIds: ['e1', 'e2'],
    dciPattern: 'Search',
    dciPipe: 'input',
    insight: 'keyword match on "Search" finds input+button. Raw HTML ranks cookie banner high by token frequency.',
  },
  {
    id: 'checkout',
    label: 'Multi-step checkout',
    question: 'Add the item to cart and proceed to checkout.',
    scoreKey: 'scoreSemantic',
    goldIds: ['e3', 'e6'],
    dciPattern: 'Cart',
    dciPipe: 'Checkout',
    agentCmd: 'click(47) Add to Cart → navigate cart → click(51) Checkout',
    insight: 'AutoWebGLM chains actions with history — GPT-4+raw HTML may click newsletter (rank #3) before finding checkout link.',
  },
  {
    id: 'filter',
    label: 'Filter then select',
    question: 'Show products under $50, then add the first result to cart.',
    scoreKey: 'scoreSemantic',
    goldIds: ['e7', 'e3'],
    dciPattern: '50',
    dciPipe: 'filter',
    insight: 'Semantic ranking surfaces price filter; simplified HTML keeps filter + product button in same local subtree.',
  },
];

export function rankByScenario(scenarioId, chunks = labChunks) {
  const scenario = labScenarios.find(s => s.id === scenarioId) || labScenarios[0];
  return [...chunks]
    .map(c => ({ ...c, score: c[scenario.scoreKey] || 0 }))
    .sort((a, b) => b.score - a.score);
}

/** Simulates AutoWebGLM hitting gold elements via prune + local context. */
export function autowebglmMatches(scenarioId, chunks = labChunks) {
  const scenario = labScenarios.find(s => s.id === scenarioId) || labScenarios[0];
  const patterns = [scenario.dciPattern, scenario.dciPipe].filter(Boolean);
  const keywordHits = chunks.filter(c => {
    const t = c.text.toLowerCase();
    return patterns.some(p => t.includes(p.toLowerCase()));
  });
  const semanticHits = rankByScenario(scenarioId, chunks)
    .filter(c => scenario.goldIds.includes(c.id) || c.score > 0.6)
    .slice(0, 4);
  const ids = new Set([...keywordHits, ...semanticHits].map(c => c.id));
  return chunks.filter(c => ids.has(c.id));
}
