/**
 * Paper Explainer page initialization.
 */

import { getPaper } from '../topics/paperRegistry.js';
import { initScrollspy } from './router.js';
import { initLearningChrome } from './learning-chrome.js';
import { mountAll as mountPlaygrounds } from '../components/playgrounds.js';
import { mountAll as mountTabs } from '../components/tab-panel.js';
import { initLabState } from './scenario-bus.js';

const CONCEPT_SECTIONS = [
  { id: 'hook', label: 'Hook', anchor: '#hook' },
  { id: 'why', label: 'Why', anchor: '#why-it-matters' },
  { id: 'viz', label: 'Play', anchor: '#interactive-viz' },
  { id: 'mechanism', label: 'How', anchor: '#core-mechanism' },
  { id: 'together', label: 'Try it', anchor: '#put-it-together' },
];

const UNDERSTAND_COMPLETE_KEY = 'dci-understand-complete';

export function initPaperConceptPage(paperId, conceptSlug, conceptData, options = {}) {
  renderPaperNav(paperId, conceptSlug, 'concept');
  initScrollspy();
  initLearningChrome({ sections: options.sections || CONCEPT_SECTIONS });
  mountPlaygrounds(conceptData);
  mountTabs();
}

export function initPaperHub(paperId) {
  renderPaperNav(paperId, null, 'hub');
  renderJourneyMap(paperId);
  initReadinessChecklist(paperId);
}

export function initPaperLab(paperId, labData, options = {}) {
  const paper = getPaper(paperId);
  const sections = options.sections || paper?.journey?.labSections || [];

  renderPaperNav(paperId, null, 'lab');
  initLabState(labData.defaultLabState || {});
  initScrollspy();
  initLearningChrome({ sections });
  mountPlaygrounds(labData);
  mountTabs();
  initReadinessChecklist(paperId);
  wireReadinessTracking(paperId);
  wireUnderstandCheckpoint(paperId);
  wireVerifyNudge();
}

function renderPaperNav(paperId, activeConceptSlug, mode) {
  const paper = getPaper(paperId);
  const list = document.querySelector('[data-paper-nav]');
  if (!paper || !list) return;

  const inConcepts = /\/concepts\//.test(window.location.pathname);
  const hubHref = inConcepts ? '../index.html' : './index.html';
  const labHref = inConcepts ? '../lab.html' : './lab.html';
  const hubActive = mode === 'hub';
  const labActive = mode === 'lab';

  list.innerHTML = `
    <li><a href="${hubHref}"${hubActive ? ' data-active="true"' : ''}>Hub</a></li>
    <li><a href="${labHref}"${labActive ? ' data-active="true"' : ''}>Paper journey</a></li>
    ${paper.concepts.map(c => {
      const href = inConcepts ? `./${c.file}` : `./concepts/${c.file}`;
      const active = activeConceptSlug === c.slug;
      return `<li><a href="${href}"${active ? ' data-active="true"' : ''}>${c.label}</a></li>`;
    }).join('')}
  `;
}

function renderJourneyMap(paperId) {
  const paper = getPaper(paperId);
  const container = document.querySelector('[data-journey-map]');
  if (!paper?.journey?.phases || !container) return;

  container.innerHTML = paper.journey.phases.map((phase, i) => `
    <a href="${phase.href}" class="journey-map__phase" data-phase="${phase.id}">
      <span class="journey-map__num">${i + 1}</span>
      <strong>${phase.label}</strong>
    </a>
  `).join('');
}

function initReadinessChecklist(paperId) {
  const paper = getPaper(paperId);
  const list = document.querySelector('[data-readiness-checklist]');
  if (!paper?.journey?.readinessChecks || !list) return;

  list.innerHTML = paper.journey.readinessChecks.map(check => `
    <li class="readiness-item" data-readiness-id="${check.id}">
      <label>
        <input type="checkbox" data-readiness-check="${check.id}" disabled>
        <span>${check.label}</span>
      </label>
    </li>
  `).join('');

  refreshReadinessUI(paperId);
}

function refreshReadinessUI(paperId) {
  const paper = getPaper(paperId);
  if (!paper?.journey?.readinessChecks) return;

  paper.journey.readinessChecks.forEach(check => {
    const item = document.querySelector(`[data-readiness-id="${check.id}"]`);
    const input = document.querySelector(`[data-readiness-check="${check.id}"]`);
    if (!item || !input) return;

    const done = isCheckComplete(check);
    input.checked = done;
    item.classList.toggle('readiness-item--done', done);
  });

  const allDone = paper.journey.readinessChecks.every(isCheckComplete);
  const banner = document.querySelector('[data-readiness-banner]');
  if (banner) {
    banner.hidden = !allDone;
  }
}

function isCheckComplete(check) {
  try {
    if (check.minCount) {
      const raw = sessionStorage.getItem(check.storageKey);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) && arr.length >= check.minCount;
    }
    return sessionStorage.getItem(check.storageKey) === '1';
  } catch (_) {
    return false;
  }
}

function markReady(key) {
  try {
    sessionStorage.setItem(key, '1');
  } catch (_) { /* ignore */ }
}

function trackReadyCount(key, id) {
  try {
    const raw = sessionStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.includes(id)) arr.push(id);
    sessionStorage.setItem(key, JSON.stringify(arr));
  } catch (_) { /* ignore */ }
}

function wireUnderstandCheckpoint(paperId) {
  const btn = document.querySelector('[data-understand-ready]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    markReady(UNDERSTAND_COMPLETE_KEY);
    refreshReadinessUI(paperId);
    updateVerifyNudge();
    document.getElementById('verify-start')?.scrollIntoView({ behavior: 'smooth' });
  });

  const understandSections = [
    'understand-hook', 'understand-problem', 'understand-insight',
    'understand-method', 'understand-evidence', 'understand-vocab',
  ];
  let seen = new Set();
  understandSections.forEach(id => {
    const section = document.getElementById(id);
    if (!section) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        seen.add(id);
        if (seen.size >= 4) {
          markReady(UNDERSTAND_COMPLETE_KEY);
          refreshReadinessUI(paperId);
          updateVerifyNudge();
        }
      }
    }, { threshold: 0.3 });
    observer.observe(section);
  });
}

function wireVerifyNudge() {
  updateVerifyNudge();
}

function updateVerifyNudge() {
  const nudge = document.querySelector('[data-verify-nudge]');
  if (!nudge) return;
  try {
    nudge.hidden = sessionStorage.getItem(UNDERSTAND_COMPLETE_KEY) === '1';
  } catch (_) {
    nudge.hidden = false;
  }
}

function wireReadinessTracking(paperId) {
  const verifySections = ['compare', 'topk', 'terminal'];
  verifySections.forEach(id => {
    const section = document.getElementById(id);
    if (!section) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        markReady('dci-ready-verify');
        refreshReadinessUI(paperId);
      }
    }, { threshold: 0.3 });
    observer.observe(section);
  });

  document.addEventListener('dci:assumption-explored', e => {
    if (e.detail?.id) {
      trackReadyCount('dci-ready-stress', e.detail.id);
      refreshReadinessUI(paperId);
    }
  });

  document.addEventListener('dci:hypothesis-saved', e => {
    if (e.detail?.id) {
      trackReadyCount('dci-ready-extend', e.detail.id);
      refreshReadinessUI(paperId);
    }
  });
}

export { refreshReadinessUI };
