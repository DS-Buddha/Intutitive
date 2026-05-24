/**
 * Shared lab state — propagates scenario/top-k across DCI playgrounds.
 */

import { on, emit } from './eventbus.js';

const STORAGE_KEY = 'dci-lab-state';

const DEFAULT_STATE = {
  scenarioId: 'sku',
  topK: 3,
  resolution: 'line',
};

let state = { ...DEFAULT_STATE };

export function getLabState() {
  return { ...state };
}

export function setLabState(partial) {
  state = { ...state, ...partial };
  try {
    const json = JSON.stringify(state);
    sessionStorage.setItem(STORAGE_KEY, json);
    localStorage.setItem(`dci-agent:${STORAGE_KEY}`, json);
  } catch (_) { /* private browsing */ }
  emit('lab:state', state);
}

export function subscribeLabState(handler) {
  on('lab:state', handler);
  handler(state);
}

export function initLabState(defaults = {}) {
  try {
    const saved = localStorage.getItem(`dci-agent:${STORAGE_KEY}`)
      ?? sessionStorage.getItem(STORAGE_KEY);
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
