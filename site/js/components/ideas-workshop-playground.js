/**
 * Ideas Workshop — brainstorm improvements that could better the DCI solution.
 */

import { improvementIdeas } from '../topics/papers/dci-agent/journey-data.js';

const STORAGE_PREFIX = 'dci-idea-';

export function mount(container, config = {}) {
  const ideas = config.ideas || improvementIdeas;

  container.className = 'playground playground--ideas';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Ideas Workshop</h3>
      <p class="playground__subtitle">How could this solution be <strong>better</strong>? Pick a seed idea or write your own — then stress-test it.</p>
    </div>
    <div class="ideas-seeds" data-ideas-seeds></div>
    <label class="playground__label">Your improvement idea</label>
    <textarea class="hypothesis-input" rows="5" placeholder="What would you change? Why is it better than plain DCI? What could still break?" data-idea-input></textarea>
    <div class="hypothesis-actions">
      <button type="button" class="btn btn--primary btn--sm" data-idea-save>Save idea</button>
      <button type="button" class="btn btn--secondary btn--sm" data-idea-reveal>See expert angles</button>
    </div>
    <div class="hypothesis-reveal" data-idea-reveal-panel hidden></div>
  `;

  const state = { selectedId: ideas[0].id };
  const seedsEl = container.querySelector('[data-ideas-seeds]');
  const input = container.querySelector('[data-idea-input]');
  const saveBtn = container.querySelector('[data-idea-save]');
  const revealBtn = container.querySelector('[data-idea-reveal]');
  const revealPanel = container.querySelector('[data-idea-reveal-panel]');

  const loadSaved = (id) => {
    try {
      return sessionStorage.getItem(STORAGE_PREFIX + id) || '';
    } catch (_) {
      return '';
    }
  };

  const renderSeeds = () => {
    seedsEl.innerHTML = ideas.map(idea => `
      <button type="button" class="ideas-seed ${idea.id === state.selectedId ? 'ideas-seed--active' : ''}" data-idea-id="${idea.id}">
        <strong>${escapeHtml(idea.title)}</strong>
        <p>${escapeHtml(idea.whyBetter)}</p>
      </button>
    `).join('');

    seedsEl.querySelectorAll('[data-idea-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedId = btn.dataset.ideaId;
        const idea = ideas.find(i => i.id === state.selectedId);
        const saved = loadSaved(state.selectedId);
        input.value = saved || idea.seed;
        revealPanel.hidden = true;
        renderSeeds();
      });
    });
  };

  saveBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    try {
      sessionStorage.setItem(STORAGE_PREFIX + state.selectedId, text);
      sessionStorage.setItem(STORAGE_PREFIX + 'custom-' + Date.now(), text);
    } catch (_) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('dci:idea-saved', { detail: { id: state.selectedId } }));
    saveBtn.textContent = 'Saved ✓';
    setTimeout(() => { saveBtn.textContent = 'Save idea'; }, 1500);
  });

  revealBtn.addEventListener('click', () => {
    const idea = ideas.find(i => i.id === state.selectedId);
    const userText = input.value.trim();
    revealPanel.hidden = false;
    revealPanel.innerHTML = `
      ${userText ? `<div class="hypothesis-compare hypothesis-compare--yours"><h4>Your idea</h4><p>${escapeHtml(userText)}</p></div>` : ''}
      <div class="hypothesis-compare hypothesis-compare--expert">
        <h4>Expert angles — ${escapeHtml(idea.title)}</h4>
        <p><strong>Why this could help:</strong> ${escapeHtml(idea.whyBetter)}</p>
        <p><strong>Framing:</strong> ${escapeHtml(idea.reveal.framing)}</p>
        <p><strong>Tradeoffs to watch:</strong></p>
        <ul>${idea.reveal.tradeoffs.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        <p><strong>Next steps to validate:</strong></p>
        <ul>${idea.reveal.nextSteps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      </div>
      <p class="playground__insight">Does your idea handle the tradeoffs above? Refine it — or discuss in Paper chat below.</p>
    `;
  });

  renderSeeds();
  input.value = loadSaved(state.selectedId) || ideas[0].seed;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
