/**
 * Paper lab progress — localStorage with sessionStorage fallback.
 */

const PREFIX = 'dci-agent:';

function prefixed(key) {
  return key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;
}

export function getProgress(key) {
  const k = prefixed(key);
  try {
    const v = localStorage.getItem(k) ?? sessionStorage.getItem(k.replace(PREFIX, ''));
    return v;
  } catch (_) {
    return null;
  }
}

export function setProgress(key, value) {
  const k = prefixed(key);
  const bare = key.replace(PREFIX, '');
  try {
    localStorage.setItem(k, value);
    sessionStorage.setItem(bare, value);
  } catch (_) { /* ignore */ }
}

export function isFlag(key) {
  return getProgress(key) === '1';
}

export function setFlag(key) {
  setProgress(key, '1');
}

export function getProgressArray(key) {
  try {
    const raw = getProgress(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

export function trackProgressArray(key, id) {
  const arr = getProgressArray(key);
  if (!arr.includes(id)) arr.push(id);
  setProgress(key, JSON.stringify(arr));
  return arr;
}

export function getProgressCount(key) {
  return getProgressArray(key).length;
}

export const KEYS = {
  understandSections: 'dci-understand-sections',
  understandComplete: 'dci-understand-complete',
  verifyPlaygrounds: 'dci-ready-verify-playgrounds',
  verifyComplete: 'dci-ready-verify',
  stress: 'dci-ready-stress',
  ideas: 'dci-ready-ideas',
  chat: 'dci-ready-chat',
  brokenAssumptions: 'dci-broken-assumptions',
  chatMessages: 'dci-chat-messages',
  savedIdeas: 'dci-saved-ideas-v2',
  onboardingDismissed: 'dci-onboarding-dismissed',
};
