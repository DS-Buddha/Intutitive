/**
 * Shared initialization for RAG concept pages (playground-first, no quiz).
 */

import { getTopic } from '../topics/registry.js';
import { initScrollspy } from './router.js';
import { initLearningChrome } from './learning-chrome.js';
import { mountAll as mountPlaygrounds } from '../components/playgrounds.js';
import { mountAll as mountTabs } from '../components/tab-panel.js';
import { mountAll as mountViz } from '../components/pipeline-viz.js';

const DEFAULT_SECTIONS = [
  { id: 'hook', label: 'Hook', anchor: '#hook' },
  { id: 'why', label: 'Why', anchor: '#why-it-matters' },
  { id: 'viz', label: 'Play', anchor: '#interactive-viz' },
  { id: 'mechanism', label: 'How', anchor: '#core-mechanism' },
  { id: 'tradeoffs', label: 'Tradeoffs', anchor: '#tradeoffs' },
  { id: 'connections', label: 'Links', anchor: '#connections' },
  { id: 'together', label: 'Try it', anchor: '#put-it-together' },
];

export function initRagConceptPage(conceptSlug, conceptData, options = {}) {
  const sections = options.sections || DEFAULT_SECTIONS;
  renderRagModuleTree(conceptSlug);
  initScrollspy();
  initLearningChrome({ sections });
  if (options.mountViz !== false) mountViz(conceptData);
  mountPlaygrounds(conceptData);
  mountTabs();
}

function renderRagModuleTree(activeSlug) {
  const topic = getTopic('rag');
  const list = document.querySelector('[data-rag-module-tree]');
  if (!topic || !list) return;

  list.innerHTML = topic.readingOrder.map((concept, i) => {
    const href = concept.path.split('/').pop();
    const isActive = concept.slug === activeSlug;
    return `<li><a href="${href}" style="font-size:var(--text-xs);"${isActive ? ' data-active="true"' : ''}>${i + 1}. ${concept.label}</a></li>`;
  }).join('');
}
