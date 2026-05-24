/**
 * Paper lab progress — localStorage with sessionStorage fallback.
 * Call initLabProgress(paperId) before any reads/writes.
 */

let paperId = 'dci-agent';
let PREFIX = 'dci-agent:';

/** Legacy bare key names for dci-agent (backward compatible). */
const LEGACY_KEY_SUFFIX = {
  'understand-sections': 'dci-understand-sections',
  'understand-complete': 'dci-understand-complete',
  'verify-playgrounds': 'dci-ready-verify-playgrounds',
  'verify-complete': 'dci-ready-verify',
  'ready-stress': 'dci-ready-stress',
  'ready-ideas': 'dci-ready-ideas',
  'ready-chat': 'dci-ready-chat',
  'broken-assumptions': 'dci-broken-assumptions',
  'chat-messages': 'dci-chat-messages',
  'saved-ideas': 'dci-saved-ideas-v2',
  'onboarding-dismissed': 'dci-onboarding-dismissed',
};

function bareKey(suffix) {
  if (paperId === 'dci-agent' && LEGACY_KEY_SUFFIX[suffix]) {
    return LEGACY_KEY_SUFFIX[suffix];
  }
  return `${paperId}-${suffix}`;
}

function buildKeys() {
  return {
    understandSections: bareKey('understand-sections'),
    understandComplete: bareKey('understand-complete'),
    verifyPlaygrounds: bareKey('verify-playgrounds'),
    verifyComplete: bareKey('verify-complete'),
    stress: bareKey('ready-stress'),
    ideas: bareKey('ready-ideas'),
    chat: bareKey('ready-chat'),
    brokenAssumptions: bareKey('broken-assumptions'),
    chatMessages: bareKey('chat-messages'),
    savedIdeas: bareKey('saved-ideas'),
    onboardingDismissed: bareKey('onboarding-dismissed'),
  };
}

export let KEYS = buildKeys();

export function initLabProgress(id) {
  paperId = id;
  PREFIX = `${id}:`;
  KEYS = buildKeys();
}

export function getPaperProgressId() {
  return paperId;
}

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

/** Map readiness check id → progress storage key for minCount / flag checks. */
export function readinessKeyForCheck(checkId) {
  const map = {
    'understand-complete': KEYS.understandComplete,
    'verify-lab': KEYS.verifyComplete,
    'stress-assumptions': KEYS.stress,
    'ideas-saved': KEYS.ideas,
    'chat-used': KEYS.chat,
  };
  return map[checkId];
}
