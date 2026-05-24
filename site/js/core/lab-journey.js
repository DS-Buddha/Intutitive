/**
 * Lab journey — progress tracking and learning flow helpers.
 */

import {
  isFlag,
  getProgressArray,
  getProgressCount,
  KEYS,
} from './lab-progress.js';

const PART_ANCHORS = {
  understand: '#understand-hook',
  verify: '#verify-start',
  think: '#think-start',
};

export function initLabJourney(paperId) {
  renderJourneyProgress();
  wireProgressListeners();
}

function wireProgressListeners() {
  const events = [
    'dci:idea-saved',
    'dci:chat-message',
    'dci:assumption-explored',
    'dci:understand-complete',
    'dci:playground-used',
    'dci:progress-updated',
  ];
  events.forEach(ev => document.addEventListener(ev, renderJourneyProgress));
}

function renderJourneyProgress() {
  const bar = document.querySelector('[data-journey-progress]');
  if (!bar) return;

  const understandDone = isFlag(KEYS.understandComplete);
  const understandCount = getProgressCount(KEYS.understandSections);
  const verifyCount = getProgressCount(KEYS.verifyPlaygrounds);
  const verifyDone = isFlag(KEYS.verifyComplete);
  const stressCount = getProgressCount(KEYS.stress);
  const ideasCount = getProgressCount(KEYS.ideas);
  const thinkDone = stressCount >= 1 && ideasCount >= 1;

  const parts = [
    {
      id: 'understand',
      label: 'Understand',
      href: PART_ANCHORS.understand,
      done: understandDone,
      sub: understandDone ? 'Complete' : `${understandCount}/6 sections`,
    },
    {
      id: 'verify',
      label: 'Verify',
      href: PART_ANCHORS.verify,
      done: verifyDone,
      sub: verifyDone ? 'Complete' : `${verifyCount}/3 core labs`,
    },
    {
      id: 'think',
      label: 'Think',
      href: PART_ANCHORS.think,
      done: thinkDone,
      sub: thinkDone ? 'Complete' : `${stressCount} scenarios · ${ideasCount} idea${ideasCount === 1 ? '' : 's'}`,
    },
  ];

  bar.innerHTML = parts.map(p => `
    <a href="${p.href}" class="journey-progress__part ${p.done ? 'journey-progress__part--done' : ''}" data-progress="${p.id}">
      <span class="journey-progress__dot"></span>
      <span class="journey-progress__text">
        <span class="journey-progress__label">${p.label}</span>
        <span class="journey-progress__sub">${p.sub}</span>
      </span>
    </a>
  `).join('');
}

export function getUnderstandSectionsSeen() {
  return getProgressArray(KEYS.understandSections);
}
