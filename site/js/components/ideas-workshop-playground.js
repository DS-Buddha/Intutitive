/**
 * Ideas Workshop — brainstorm improvements (single-page form, always editable).
 */

import { getLabState } from '../core/scenario-bus.js';
import { getProgress, setProgress, KEYS } from '../core/lab-progress.js';

const SEED_ICONS = {
  'hybrid-interface': '⊕',
  'adaptive-resolution': '◎',
  'smart-context': '◈',
  'web-scale-bridge': '⇄',
  'safe-dci': '⬡',
};

function getBrokenAssumptions() {
  try {
    const raw = getProgress(KEYS.brokenAssumptions);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function getScenarioHint() {
  const { scenarioId, topK } = getLabState();
  if (scenarioId === 'sku' && topK <= 2) {
    return `You lost gold evidence at top-k=${topK} in the labs — consider a fix for recall.`;
  }
  if (scenarioId === 'error-code') {
    return 'You explored piped grep in the terminal lab — how would you scale that pattern?';
  }
  return '';
}

export function mount(container, config = {}) {
  const seeds = config.ideas;
  const paperLabel = config.paperLabel || 'the paper';
  const paperId = config.paperId || null;
  let highlightedSeedIds = new Set();

  if (!seeds?.length) {
    container.textContent = 'Ideas workshop requires config.ideas in lab-data.js';
    return;
  }

  container.className = 'playground playground--ideas playground--interactive';
  container.innerHTML = `
    <div class="playground__header playground__header--accent">
      <div class="playground__header-icon" aria-hidden="true">💡</div>
      <div>
        <h3 class="playground__title">Ideas Workshop</h3>
        <p class="playground__subtitle">Pick a starting point, draft your improvement, save, then discuss in Paper chat.</p>
        <p class="ideas-scenario-hint" data-scenario-hint hidden></p>
      </div>
    </div>

    <div class="ideas-layout">
      <section class="ideas-panel ideas-panel--seeds">
        <div class="ideas-panel__head">
          <span class="ideas-panel__step">1</span>
          <div>
            <h4 class="ideas-panel__title">Starting points</h4>
            <p class="ideas-panel__hint">Click a card to pre-fill — highlighted cards match assumptions you broke</p>
          </div>
        </div>
        <div class="ideas-seeds" data-ideas-seeds></div>
        <button type="button" class="ideas-seed ideas-seed--blank" data-seed-custom>
          <span class="ideas-seed__icon" aria-hidden="true">✎</span>
          <span><strong>Start blank</strong><span class="ideas-seed__meta">Clear the form and write your own idea</span></span>
        </button>
      </section>

      <section class="ideas-panel ideas-panel--draft">
        <div class="ideas-panel__head">
          <span class="ideas-panel__step">2</span>
          <div>
            <h4 class="ideas-panel__title">Your draft</h4>
            <p class="ideas-panel__hint">Four fields — think like a researcher proposing a paper extension</p>
          </div>
        </div>
        <div class="ideas-form">
          <div class="ideas-form__field">
            <label class="ideas-form__label" for="ideas-limitation">Limitation</label>
            <p class="ideas-form__hint">What gap or failure mode does your idea address?</p>
            <input type="text" id="ideas-limitation" class="ideas-field" data-field="limitation" placeholder="e.g. fails on web-scale corpora" autocomplete="off">
          </div>
          <div class="ideas-form__field">
            <label class="ideas-form__label" for="ideas-improvement">Your improvement</label>
            <p class="ideas-form__hint">What would you build or change?</p>
            <textarea id="ideas-improvement" class="ideas-field ideas-field--area" rows="3" data-field="improvement" placeholder="Describe your proposed method or interface change…"></textarea>
          </div>
          <div class="ideas-form__field">
            <label class="ideas-form__label" for="ideas-why">Why better than the paper's approach?</label>
            <p class="ideas-form__hint">Expected gain — accuracy, cost, safety, scale…</p>
            <textarea id="ideas-why" class="ideas-field ideas-field--area" rows="2" data-field="whyBetter" placeholder="What improves vs. the baseline, and why?"></textarea>
          </div>
          <div class="ideas-form__field">
            <label class="ideas-form__label" for="ideas-risk">What could still break?</label>
            <p class="ideas-form__hint">Honest tradeoff or failure mode under stress.</p>
            <textarea id="ideas-risk" class="ideas-field ideas-field--area" rows="2" data-field="risk" placeholder="When would this approach fail or cost too much?"></textarea>
          </div>
        </div>
        <div class="ideas-toolbar">
          <button type="button" class="btn btn--primary btn--sm" data-ideas-save>Save idea</button>
          <button type="button" class="btn btn--secondary btn--sm" data-ideas-reveal>Expert angles</button>
          <button type="button" class="btn btn--ghost btn--sm" data-ideas-to-chat>Send to chat ↓</button>
        </div>
      </section>
    </div>

    <div class="hypothesis-reveal" data-idea-reveal-panel hidden></div>

    <div class="ideas-saved">
      <h4 class="ideas-saved__heading">Saved ideas</h4>
      <ul class="ideas-saved__list" data-ideas-saved-list></ul>
    </div>
  `;

  const state = { seedId: null };
  const scenarioHintEl = container.querySelector('[data-scenario-hint]');
  const seedsEl = container.querySelector('[data-ideas-seeds]');
  const blankBtn = container.querySelector('[data-seed-custom]');
  const revealPanel = container.querySelector('[data-idea-reveal-panel]');
  const savedList = container.querySelector('[data-ideas-saved-list]');

  const fields = {
    limitation: container.querySelector('[data-field="limitation"]'),
    improvement: container.querySelector('[data-field="improvement"]'),
    whyBetter: container.querySelector('[data-field="whyBetter"]'),
    risk: container.querySelector('[data-field="risk"]'),
  };

  const updateScenarioHint = () => {
    const hint = getScenarioHint();
    if (hint) {
      scenarioHintEl.hidden = false;
      scenarioHintEl.textContent = hint;
    } else {
      scenarioHintEl.hidden = true;
    }
  };

  const updateHighlights = () => {
    highlightedSeedIds = new Set(
      getBrokenAssumptions().map(a => a.seedId).filter(Boolean)
    );
  };

  const getLimitationFromAssumptions = () => {
    const broken = getBrokenAssumptions();
    if (!broken.length) return '';
    const latest = broken[broken.length - 1];
    return latest.verdict || latest.title || '';
  };

  const getSeed = () => (state.seedId ? seeds.find(s => s.id === state.seedId) : null);

  const readDraft = () => ({
    limitation: fields.limitation.value.trim(),
    improvement: fields.improvement.value.trim(),
    whyBetter: fields.whyBetter.value.trim(),
    risk: fields.risk.value.trim(),
  });

  const fillDraft = (draft) => {
    fields.limitation.value = draft.limitation || '';
    fields.improvement.value = draft.improvement || '';
    fields.whyBetter.value = draft.whyBetter || '';
    fields.risk.value = draft.risk || '';
  };

  const loadSavedIdeas = () => {
    try {
      const raw = getProgress(KEYS.savedIdeas);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  };

  const persistSavedIdeas = (list) => {
    setProgress(KEYS.savedIdeas, JSON.stringify(list));
  };

  const sendToChat = (draft, seed, send = false) => {
    document.dispatchEvent(new CustomEvent('dci:chat-prefill', {
      detail: {
        message: formatIdeaForChat(draft, seed, paperLabel),
        paperId,
        scroll: true,
        send,
        highlight: true,
      },
    }));
  };

  const renderSaved = () => {
    const list = loadSavedIdeas();
    savedList.innerHTML = list.length
      ? list.map(i => `
        <li class="ideas-saved__item">
          <span class="ideas-saved__badge" aria-hidden="true">✓</span>
          <div class="ideas-saved__body">
            <strong>${escapeHtml(i.title)}</strong>
            <p>${escapeHtml(i.improvement.slice(0, 120))}${i.improvement.length > 120 ? '…' : ''}</p>
          </div>
          <button type="button" class="btn btn--ghost btn--sm" data-discuss-id="${escapeHtml(i.id)}">Discuss in chat</button>
        </li>`).join('')
      : '<li class="ideas-saved__empty">No ideas saved yet — draft one above and hit Save.</li>';

    savedList.querySelectorAll('[data-discuss-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idea = list.find(x => x.id === btn.dataset.discussId);
        if (idea) {
          sendToChat(idea, seeds.find(s => s.id === idea.seedId), false);
        }
      });
    });
  };

  const applySeed = (seedId) => {
    state.seedId = seedId;
    if (seedId === 'custom') {
      fillDraft({ limitation: getLimitationFromAssumptions(), improvement: '', whyBetter: '', risk: '' });
    } else {
      const seed = seeds.find(s => s.id === seedId);
      if (seed) {
        fillDraft({
          limitation: getLimitationFromAssumptions() || `Gap: ${seed.title}`,
          improvement: seed.seed,
          whyBetter: seed.whyBetter,
          risk: '',
        });
      }
    }
    revealPanel.hidden = true;
    renderSeeds();
    fields.improvement.focus();
  };

  const renderSeeds = () => {
    updateHighlights();
    seedsEl.innerHTML = seeds.map((idea, i) => `
      <button type="button" class="ideas-seed ${idea.id === state.seedId ? 'ideas-seed--active' : ''} ${highlightedSeedIds.has(idea.id) ? 'ideas-seed--suggested' : ''}" data-idea-id="${idea.id}">
        <span class="ideas-seed__icon" aria-hidden="true">${SEED_ICONS[idea.id] || (i + 1)}</span>
        <span class="ideas-seed__body">
          <strong>${escapeHtml(idea.title)}</strong>
          <p>${escapeHtml(idea.whyBetter)}</p>
          ${highlightedSeedIds.has(idea.id) ? '<span class="ideas-seed__tag">Matches your broken assumption</span>' : ''}
        </span>
      </button>
    `).join('');

    seedsEl.querySelectorAll('[data-idea-id]').forEach(btn => {
      btn.addEventListener('click', () => applySeed(btn.dataset.ideaId));
    });
  };

  blankBtn.addEventListener('click', () => applySeed('custom'));

  container.querySelector('[data-ideas-save]').addEventListener('click', () => {
    const draft = readDraft();
    if (!draft.improvement) {
      fields.improvement.focus();
      return;
    }
    const seed = getSeed();
    const entry = {
      id: `${state.seedId || 'custom'}-${Date.now()}`,
      seedId: state.seedId,
      title: seed?.title || 'Custom improvement',
      ...draft,
      savedAt: new Date().toISOString(),
    };
    const list = loadSavedIdeas();
    list.push(entry);
    persistSavedIdeas(list);
    document.dispatchEvent(new CustomEvent('dci:idea-saved', { detail: { id: entry.id } }));
    renderSaved();
    const btn = container.querySelector('[data-ideas-save]');
    btn.textContent = 'Saved ✓';
    setTimeout(() => { btn.textContent = 'Save idea'; }, 2000);
  });

  container.querySelector('[data-ideas-reveal]').addEventListener('click', () => {
    const draft = readDraft();
    const seed = getSeed();
    revealPanel.hidden = false;
    if (seed && state.seedId !== 'custom') {
      revealPanel.innerHTML = `
        <div class="hypothesis-compare hypothesis-compare--expert">
          <h4>Expert angles — ${escapeHtml(seed.title)}</h4>
          <p><strong>Framing:</strong> ${escapeHtml(seed.reveal.framing)}</p>
          <p><strong>Tradeoffs:</strong></p>
          <ul>${seed.reveal.tradeoffs.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
          <p><strong>Validate with:</strong></p>
          <ul>${seed.reveal.nextSteps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
        </div>`;
    } else {
      revealPanel.innerHTML = `
        <div class="hypothesis-compare hypothesis-compare--expert">
          <h4>Stress-test your idea</h4>
          <ul>
            <li>Which assumption from Assumption breaker does this fix?</li>
            <li>Does it preserve the paper's core advantage?</li>
            <li>What experiment would prove it beats the baseline?</li>
          </ul>
        </div>`;
    }
    if (draft.improvement) {
      revealPanel.insertAdjacentHTML('afterbegin', `
        <div class="hypothesis-compare hypothesis-compare--yours"><h4>Your draft</h4><p>${escapeHtml(draft.improvement)}</p></div>
      `);
    }
  });

  container.querySelector('[data-ideas-to-chat]').addEventListener('click', () => {
    const draft = readDraft();
    if (!draft.improvement) {
      fields.improvement.focus();
      return;
    }
    sendToChat(draft, getSeed(), false);
  });

  document.addEventListener('dci:assumptions-changed', () => {
    renderSeeds();
  });

  Object.values(fields).forEach(el => {
    el.removeAttribute('readonly');
    el.removeAttribute('disabled');
  });

  updateScenarioHint();
  renderSeeds();
  renderSaved();
}

function formatIdeaForChat(draft, seed, paperLabel = 'the paper') {
  const title = seed?.title ? ` (${seed.title})` : '';
  return `I'd like to discuss my improvement idea for ${paperLabel}${title}:

Limitation: ${draft.limitation || 'not specified'}
Improvement: ${draft.improvement}
Why better: ${draft.whyBetter || 'not specified'}
Risk: ${draft.risk || 'not specified'}

Please critique — what's strong, what's missing, and what experiment would validate it?`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
