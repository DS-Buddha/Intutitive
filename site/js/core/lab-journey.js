/**
 * Lab journey — progress tracking and learning flow helpers.
 */

import { getPaper } from '../topics/paperRegistry.js';
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

let activePaperId = null;
let progressListenersWired = false;

export function initLabJourney(paperId) {
  activePaperId = paperId;
  renderJourneyProgress();
  wireProgressListeners();
}

function getJourneyConfig() {
  const paper = getPaper(activePaperId);
  const checks = paper?.journey?.readinessChecks || [];
  const stressCheck = checks.find(c => c.id === 'stress-assumptions');
  const ideasCheck = checks.find(c => c.id === 'ideas-saved');
  return {
    understandCount: paper?.journey?.understandSectionIds?.length ?? 6,
    coreVerifyCount: paper?.journey?.coreVerifyPlaygrounds?.length ?? 3,
    thinkStressMin: stressCheck?.minCount ?? 1,
    thinkIdeasMin: ideasCheck?.minCount ?? 1,
  };
}

function wireProgressListeners() {
  if (progressListenersWired) return;
  progressListenersWired = true;
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

  const { understandCount, coreVerifyCount, thinkStressMin, thinkIdeasMin } = getJourneyConfig();
  const understandDone = isFlag(KEYS.understandComplete);
  const understandSeen = getProgressCount(KEYS.understandSections);
  const verifySeen = getProgressCount(KEYS.verifyPlaygrounds);
  const verifyDone = isFlag(KEYS.verifyComplete);
  const stressCount = getProgressCount(KEYS.stress);
  const ideasCount = getProgressCount(KEYS.ideas);
  const thinkDone = stressCount >= thinkStressMin && ideasCount >= thinkIdeasMin;

  const parts = [
    {
      id: 'understand',
      label: 'Understand',
      href: PART_ANCHORS.understand,
      done: understandDone,
      sub: understandDone ? 'Complete' : `${understandSeen}/${understandCount} sections`,
    },
    {
      id: 'verify',
      label: 'Verify',
      href: PART_ANCHORS.verify,
      done: verifyDone,
      sub: verifyDone ? 'Complete' : `${verifySeen}/${coreVerifyCount} core labs`,
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
