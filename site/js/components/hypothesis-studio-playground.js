/**
 * Hypothesis studio — write extension hypotheses, reveal expert takes.
 */

import { extensionPrompts } from '../topics/papers/dci-agent/journey-data.js';

const STORAGE_PREFIX = 'dci-hypothesis-';

export function mount(container, config = {}) {
  const prompts = config.prompts || extensionPrompts;

  container.className = 'playground playground--hypothesis';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Research Extension Studio</h3>
      <p class="playground__subtitle">Write what you think would happen — then compare to an expert take. No code required.</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group playground__control-group--wide">
        <label class="playground__label">Extension prompt</label>
        <select class="playground__select" data-hyp-prompt></select>
      </div>
    </div>
    <div class="hypothesis-prompt-card" data-hyp-prompt-card></div>
    <label class="playground__label">Your hypothesis</label>
    <textarea class="hypothesis-input" rows="4" placeholder="What would improve? What would break? What tradeoffs do you expect?" data-hyp-input></textarea>
    <div class="hypothesis-actions">
      <button type="button" class="btn btn--primary btn--sm" data-hyp-save>Save hypothesis</button>
      <button type="button" class="btn btn--secondary btn--sm" data-hyp-reveal>Reveal expert take</button>
    </div>
    <div class="hypothesis-reveal" data-hyp-reveal-panel hidden></div>
  `;

  const state = { promptId: prompts[0].id, revealed: false };
  const promptSel = container.querySelector('[data-hyp-prompt]');
  const promptCard = container.querySelector('[data-hyp-prompt-card]');
  const input = container.querySelector('[data-hyp-input]');
  const saveBtn = container.querySelector('[data-hyp-save]');
  const revealBtn = container.querySelector('[data-hyp-reveal]');
  const revealPanel = container.querySelector('[data-hyp-reveal-panel]');

  promptSel.innerHTML = prompts.map((p, i) =>
    `<option value="${p.id}">Prompt ${i + 1}: ${p.prompt.slice(0, 60)}…</option>`
  ).join('');

  const loadSaved = (id) => {
    try {
      return sessionStorage.getItem(STORAGE_PREFIX + id) || '';
    } catch (_) {
      return '';
    }
  };

  const renderPrompt = () => {
    const p = prompts.find(x => x.id === state.promptId);
    state.revealed = false;
    revealPanel.hidden = true;
    promptCard.innerHTML = `<p><strong>${p.prompt}</strong></p><p class="text-secondary">Related: ${p.relatedSection || ''}</p>`;
    input.value = loadSaved(state.promptId);
  };

  saveBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    try {
      sessionStorage.setItem(STORAGE_PREFIX + state.promptId, text);
    } catch (_) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('dci:hypothesis-saved', { detail: { id: state.promptId } }));
    saveBtn.textContent = 'Saved ✓';
    setTimeout(() => { saveBtn.textContent = 'Save hypothesis'; }, 1500);
  });

  revealBtn.addEventListener('click', () => {
    const p = prompts.find(x => x.id === state.promptId);
    const userText = input.value.trim();
    revealPanel.hidden = false;
    revealPanel.innerHTML = `
      ${userText ? `<div class="hypothesis-compare hypothesis-compare--yours"><h4>Your hypothesis</h4><p>${escapeHtml(userText)}</p></div>` : ''}
      <div class="hypothesis-compare hypothesis-compare--expert">
        <h4>Expert take</h4>
        <p><strong>Framing:</strong> ${escapeHtml(p.reveal.framing)}</p>
        <ul>${p.reveal.tradeoffs.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        <p><strong>Extension directions:</strong></p>
        <ul>${p.reveal.directions.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
      </div>
      <p class="playground__insight">Gap between your hypothesis and the expert take = learning moment. What did you miss?</p>
    `;
    state.revealed = true;
  });

  promptSel.addEventListener('change', () => {
    state.promptId = promptSel.value;
    renderPrompt();
  });

  renderPrompt();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
