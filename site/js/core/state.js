/**
 * Module-level state singleton. One instance per page load.
 * Simple object that holds the current page context.
 */

export const state = {
  currentTopic: null,
  currentConcept: null,
  sectionsVisited: new Set(),
  quizAnswers: new Map(),
};

export function setState(key, value) {
  state[key] = value;
}

export function getState(key) {
  return state[key];
}

export function reset() {
  state.currentTopic = null;
  state.currentConcept = null;
  state.sectionsVisited.clear();
  state.quizAnswers.clear();
}
