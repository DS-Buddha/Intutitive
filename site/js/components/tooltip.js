/**
 * Tooltip Component
 * Floating info cards triggered by hover or click.
 * Uses popover API where available, falls back to positioned div.
 */

const tooltips = new Map();

/**
 * Initialize all tooltips on the page.
 */
export function mountAll() {
  const elements = document.querySelectorAll('[data-tooltip]');
  elements.forEach(el => {
    const key = el.getAttribute('data-tooltip');
    initTooltip(el, key);
  });
}

/**
 * Initialize a single tooltip element.
 */
function initTooltip(element, key) {
  const content = getTooltipContent(key);
  if (!content) return;

  let tooltip;

  // Use popover API if available
  if ('popover' in element) {
    tooltip = document.createElement('div');
    tooltip.setAttribute('popover', 'auto');
    tooltip.className = 'tooltip';
    tooltip.style.backgroundColor = 'var(--color-bg-elevated)';
    tooltip.style.border = '1px solid var(--color-border)';
    tooltip.style.borderRadius = 'var(--radius-md)';
    tooltip.style.padding = 'var(--space-3)';
    tooltip.style.maxWidth = '250px';
    tooltip.style.fontSize = 'var(--text-sm)';
    tooltip.style.zIndex = 'var(--z-tooltip)';
    tooltip.textContent = content;
    document.body.appendChild(tooltip);
    tooltips.set(key, tooltip);

    element.addEventListener('mouseenter', () => {
      element.popoverTargetElement = tooltip;
      tooltip.showPopover();
    });

    element.addEventListener('mouseleave', () => {
      tooltip.hidePopover();
    });

    element.addEventListener('click', (e) => {
      e.preventDefault();
      tooltip.showPopover();
    });
  } else {
    // Fallback: positioned div
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip tooltip-fallback';
    tooltip.style.display = 'none';
    tooltip.style.position = 'fixed';
    tooltip.style.backgroundColor = 'var(--color-bg-elevated)';
    tooltip.style.border = '1px solid var(--color-border)';
    tooltip.style.borderRadius = 'var(--radius-md)';
    tooltip.style.padding = 'var(--space-3)';
    tooltip.style.maxWidth = '250px';
    tooltip.style.fontSize = 'var(--text-sm)';
    tooltip.style.zIndex = 'var(--z-tooltip)';
    tooltip.style.boxShadow = 'var(--shadow-lg)';
    tooltip.textContent = content;
    document.body.appendChild(tooltip);
    tooltips.set(key, tooltip);

    element.addEventListener('mouseenter', () => {
      const rect = element.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = `${rect.left + rect.width / 2 - 125}px`;
      tooltip.style.top = `${rect.top - 10}px`;
      tooltip.style.transform = 'translateY(-100%)';
    });

    element.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    element.addEventListener('click', (e) => {
      e.preventDefault();
      const rect = element.getBoundingClientRect();
      tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
      tooltip.style.left = `${rect.left + rect.width / 2 - 125}px`;
      tooltip.style.top = `${rect.top - 10}px`;
      tooltip.style.transform = 'translateY(-100%)';
    });
  }
}

/**
 * Get tooltip content by key.
 * Extend this function to return content for specific tooltip terms.
 */
function getTooltipContent(key) {
  const glossary = {
    'dense-embedding': 'Dense embeddings represent text as floating-point vectors in high-dimensional space. They capture semantic meaning but lose lexical detail.',
    'sparse-embedding': 'Sparse embeddings (like BM25) use term frequency to create high-dimensional vectors with mostly zeros. Efficient but less semantic.',
    'maxsim': 'Maximum similarity: for each query token, find the highest similarity match across all document tokens. Preserves lexical precision.',
    'colbert': 'ColBERT uses token-level embeddings and MaxSim matching instead of pooling embeddings into single vectors.',
    'hyde': 'Hypothetical Document Embeddings: generate plausible hypothetical documents from a query, then embed the hypothesis instead of the original query.',
    'raptor': 'Recursive Abstractive Processing for Tree-Organized Retrieval: cluster chunks hierarchically, summarize clusters, and index summaries at multiple levels.',
    'graphrag': 'Graph-based RAG: extract entities and relationships into a knowledge graph, then retrieve via community summaries.',
    'self-rag': 'Self-RAG: the model generates reflection tokens (IsREL, IsSUP, IsUSE) to assess whether retrieval and generation are relevant and supported.',
    'crag': 'Corrective RAG: retrieve, evaluate relevance, and correct retrieval if needed by regenerating the query or expanding retrieval scope.',
  };

  return glossary[key] || null;
}

/**
 * Create a tooltip manually.
 */
export function createTooltip(element, content) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = content;
  tooltip.style.display = 'none';
  tooltip.style.position = 'fixed';
  tooltip.style.backgroundColor = 'var(--color-bg-elevated)';
  tooltip.style.border = '1px solid var(--color-border)';
  tooltip.style.borderRadius = 'var(--radius-md)';
  tooltip.style.padding = 'var(--space-3)';
  tooltip.style.maxWidth = '250px';
  tooltip.style.fontSize = 'var(--text-sm)';
  tooltip.style.zIndex = 'var(--z-tooltip)';
  document.body.appendChild(tooltip);

  element.addEventListener('mouseenter', () => {
    const rect = element.getBoundingClientRect();
    tooltip.style.display = 'block';
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
  });

  element.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  return tooltip;
}

/**
 * Mount tooltip component.
 */
export function mountTooltip() {
  mountAll();
}
