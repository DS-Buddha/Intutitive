/**
 * Shared lab state — propagates scenario/top-k across connected playgrounds.
 */

import { on, emit } from './eventbus.js';

const LEGACY_STORAGE_KEY = 'dci-lab-state';

let paperId = 'dci-agent';

const DEFAULT_STATE = {
  scenarioId: 'sku',
  topK: 3,
  resolution: 'line',
};

let state = { ...DEFAULT_STATE };

function storageKey() {
  if (paperId === 'dci-agent') return LEGACY_STORAGE_KEY;
  return `${paperId}-lab-state`;
}

function fullStorageKey() {
  return `${paperId}:${storageKey()}`;
}

export function getLabState() {
  return { ...state };
}

export function setLabState(partial) {
  state = { ...state, ...partial };
  try {
    const json = JSON.stringify(state);
    sessionStorage.setItem(storageKey(), json);
    localStorage.setItem(fullStorageKey(), json);
  } catch (_) { /* private browsing */ }
  emit('lab:state', state);
}

export function subscribeLabState(handler) {
  on('lab:state', handler);
  handler(state);
}

export function initLabState(defaults = {}, id = 'dci-agent') {
  paperId = id;
  try {
    const saved = localStorage.getItem(fullStorageKey())
      ?? sessionStorage.getItem(storageKey());
    if (saved) {
      state = { ...DEFAULT_STATE, ...JSON.parse(saved), ...defaults };
    } else {
      state = { ...DEFAULT_STATE, ...defaults };
    }
  } catch (_) {
    state = { ...DEFAULT_STATE, ...defaults };
  }
  emit('lab:state', state);
  return state;
}
