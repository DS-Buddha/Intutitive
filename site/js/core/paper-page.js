/**
 * Paper Explainer page initialization.
 */

import { getPaper } from '../topics/paperRegistry.js';
import { initScrollspy } from './router.js';
import { initLearningChrome } from './learning-chrome.js';
import { mountAll as mountPlaygrounds } from '../components/playgrounds.js';
import { mountAll as mountTabs } from '../components/tab-panel.js';
import { initLabState } from './scenario-bus.js';
import { initLabJourney } from './lab-journey.js';
import { initLabOnboarding } from './lab-onboarding.js';
import {
  initLabProgress,
  isFlag,
  setFlag,
  getProgressCount,
  trackProgressArray,
  KEYS,
  readinessKeyForCheck,
} from './lab-progress.js';

const CONCEPT_SECTIONS = [
  { id: 'hook', label: 'Hook', anchor: '#hook' },
  { id: 'why', label: 'Why', anchor: '#why-it-matters' },
  { id: 'viz', label: 'Play', anchor: '#interactive-viz' },
  { id: 'mechanism', label: 'How', anchor: '#core-mechanism' },
  { id: 'together', label: 'Try it', anchor: '#put-it-together' },
];

const DEFAULT_UNDERSTAND_SECTION_IDS = [
  'understand-hook', 'understand-problem', 'understand-insight',
  'understand-method', 'understand-evidence', 'understand-vocab',
];

const DEFAULT_CORE_VERIFY_PLAYGROUNDS = ['compare', 'topk', 'terminal'];

let activeLabPaper = null;

export function initPaperConceptPage(paperId, conceptSlug, conceptData, options = {}) {
  renderPaperNav(paperId, conceptSlug, 'concept');
  initScrollspy();
  initLearningChrome({ sections: options.sections || CONCEPT_SECTIONS });
  mountPlaygrounds(conceptData);
  mountTabs();
}

export function initPaperHub(paperId) {
  initLabProgress(paperId);
  renderPaperNav(paperId, null, 'hub');
  renderJourneyMap(paperId);
  initReadinessChecklist(paperId);
}

export function initPaperLab(paperId, labData, options = {}) {
  const paper = getPaper(paperId);
  activeLabPaper = paper;
  const sections = options.sections || paper?.journey?.labSections || [];
  const partGroups = paper?.journey?.partGroups || [];

  initLabProgress(paperId);
  renderPaperNav(paperId, null, 'lab');
  initLabState(labData.defaultLabState || {}, paperId);
  initScrollspy();
  initLearningChrome({
    sections,
    partGroups,
    sectionProgress: 'part-scoped',
    floatingNav: 'part-aware',
  });
  mountPlaygrounds(labData);
  mountTabs();
  initLabOnboarding({
    title: paper?.title,
    timeEstimate: paper?.journey?.onboarding?.timeEstimate,
  });
  initReadinessChecklist(paperId);
  wireReadinessTracking(paperId);
  wireJourneyNudges();
  initLabJourney(paperId);
  document.body.classList.add('page-layout--lab');
}

function getUnderstandSectionIds() {
  return activeLabPaper?.journey?.understandSectionIds ?? DEFAULT_UNDERSTAND_SECTION_IDS;
}

function getCoreVerifyPlaygrounds() {
  return activeLabPaper?.journey?.coreVerifyPlaygrounds ?? DEFAULT_CORE_VERIFY_PLAYGROUNDS;
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

  const timeEstimate = paper.journey.onboarding?.timeEstimate || '45–60 minutes';

  container.innerHTML = `
    <div class="journey-map">
      ${paper.journey.phases.map((phase, i) => `
        <a href="${phase.href}" class="journey-map__phase" data-phase="${phase.id}">
          <span class="journey-map__num">${i + 1}</span>
          <strong>${phase.label}</strong>
        </a>
      `).join('')}
    </div>
    <p class="journey-map__meta text-secondary">Estimated time: ${timeEstimate} · Part 1 read-only, then playgrounds, then critique</p>
  `;
}

function initReadinessChecklist(paperId) {
  const paper = getPaper(paperId);
  const list = document.querySelector('[data-readiness-checklist]');
  if (!paper?.journey?.readinessChecks || !list) return;

  list.innerHTML = paper.journey.readinessChecks.map(check => `
    <li class="readiness-item" data-readiness-id="${check.id}">
      <label>
        <input type="checkbox" data-readiness-check="${check.id}" disabled>
        <span class="readiness-item__text">
          <span class="readiness-item__label">${check.label}</span>
          ${check.hint ? `<span class="readiness-item__hint">${check.hint}</span>` : ''}
          <span class="readiness-item__fraction" data-readiness-fraction="${check.id}"></span>
        </span>
      </label>
    </li>
  `).join('');

  refreshReadinessUI(paperId);
}

function refreshReadinessUI(paperId) {
  const paper = getPaper(paperId);
  if (!paper?.journey?.readinessChecks) return;

  const understandTotal = getUnderstandSectionIds().length;
  const verifyTotal = getCoreVerifyPlaygrounds().length;

  paper.journey.readinessChecks.forEach(check => {
    const item = document.querySelector(`[data-readiness-id="${check.id}"]`);
    const input = document.querySelector(`[data-readiness-check="${check.id}"]`);
    const fractionEl = document.querySelector(`[data-readiness-fraction="${check.id}"]`);
    if (!item || !input) return;

    const { done, fraction } = getCheckStatus(check, { understandTotal, verifyTotal });
    input.checked = done;
    item.classList.toggle('readiness-item--done', done);
    if (fractionEl) fractionEl.textContent = fraction || '';
  });

  const allDone = paper.journey.readinessChecks.every(c => getCheckStatus(c, { understandTotal, verifyTotal }).done);
  const banner = document.querySelector('[data-readiness-banner]');
  if (banner) banner.hidden = !allDone;

  document.dispatchEvent(new CustomEvent('dci:progress-updated'));
}

function getCheckStatus(check, { understandTotal, verifyTotal }) {
  if (check.id === 'understand-complete') {
    const count = getProgressCount(KEYS.understandSections);
    return {
      done: isFlag(KEYS.understandComplete),
      fraction: isFlag(KEYS.understandComplete) ? '' : `${count}/${understandTotal} sections`,
    };
  }
  if (check.id === 'verify-lab') {
    const count = getProgressCount(KEYS.verifyPlaygrounds);
    return {
      done: isFlag(KEYS.verifyComplete),
      fraction: isFlag(KEYS.verifyComplete) ? '' : `${count}/${verifyTotal} labs`,
    };
  }
  const storageKey = readinessKeyForCheck(check.id) || check.storageKey;
  if (check.minCount) {
    const count = getProgressCount(storageKey);
    return {
      done: count >= check.minCount,
      fraction: count >= check.minCount ? '' : `${count}/${check.minCount}`,
    };
  }
  return {
    done: isFlag(storageKey),
    fraction: '',
  };
}

function markUnderstandSection(id) {
  trackProgressArray(KEYS.understandSections, id);
  const count = getProgressCount(KEYS.understandSections);
  if (count >= getUnderstandSectionIds().length) {
    setFlag(KEYS.understandComplete);
  }
}

function markVerifyPlayground(id) {
  trackProgressArray(KEYS.verifyPlaygrounds, id);
  const count = getProgressCount(KEYS.verifyPlaygrounds);
  if (count >= getCoreVerifyPlaygrounds().length) {
    setFlag(KEYS.verifyComplete);
  }
}

function wireJourneyNudges() {
  updateVerifyNudge();
  updateThinkNudge();
}

function updateVerifyNudge() {
  const nudge = document.querySelector('[data-verify-nudge]');
  if (nudge) nudge.hidden = isFlag(KEYS.understandComplete);
}

function updateThinkNudge() {
  const nudge = document.querySelector('[data-think-nudge]');
  if (nudge) nudge.hidden = isFlag(KEYS.verifyComplete);
}

function wireReadinessTracking(paperId) {
  getUnderstandSectionIds().forEach(id => {
    const section = document.getElementById(id);
    if (!section) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        markUnderstandSection(id);
        updateVerifyNudge();
        refreshReadinessUI(paperId);
        if (isFlag(KEYS.understandComplete)) {
          document.dispatchEvent(new CustomEvent('dci:understand-complete'));
        }
      }
    }, { threshold: 0.3 });
    observer.observe(section);
  });

  document.addEventListener('dci:playground-used', e => {
    if (e.detail?.id && getCoreVerifyPlaygrounds().includes(e.detail.id)) {
      markVerifyPlayground(e.detail.id);
      updateThinkNudge();
      refreshReadinessUI(paperId);
    }
  });

  document.addEventListener('dci:assumption-explored', e => {
    if (e.detail?.id) {
      trackProgressArray(KEYS.stress, e.detail.id);
      refreshReadinessUI(paperId);
    }
  });

  document.addEventListener('dci:idea-saved', e => {
    if (e.detail?.id) {
      trackProgressArray(KEYS.ideas, e.detail.id);
      refreshReadinessUI(paperId);
    }
  });

  document.addEventListener('dci:chat-message', () => {
    setFlag(KEYS.chat);
    refreshReadinessUI(paperId);
  });
}

export { refreshReadinessUI };
