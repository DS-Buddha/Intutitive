/**
 * Paradigm compare — step-through baseline vs agent retrieval trajectories.
 */

import { mergeLabels, PARADIGM_LABELS } from './playground-labels.js';

export function mount(container, config = {}) {
  const retrieverSteps = config.retrieverSteps || config.baselineSteps;
  const agentSteps = config.agentSteps || config.dciSteps;
  const labels = mergeLabels(PARADIGM_LABELS, config.labels);
  const stepCount = retrieverSteps?.length || agentSteps?.length || 4;

  if (!retrieverSteps?.length || !agentSteps?.length) {
    container.textContent = 'Paradigm compare requires retrieverSteps and agentSteps in lab-data.js';
    return;
  }

  container.className = 'playground playground--paradigm';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">${labels.title}</h3>
      <p class="playground__subtitle">${labels.subtitle}</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group">
        <label class="playground__label">Step <span class="playground__value" data-paradigm-step-val>1</span> / ${stepCount}</label>
        <input type="range" min="1" max="${stepCount}" value="1" data-paradigm-step>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Highlight</label>
        <select class="playground__select" data-paradigm-mode>
          <option value="both">Both side by side</option>
          <option value="retriever">${labels.highlightBaseline}</option>
          <option value="dci">${labels.highlightAgent}</option>
        </select>
      </div>
    </div>
    <div class="paradigm-grid">
      <div class="playground__panel paradigm-panel paradigm-panel--retriever" data-paradigm-r>
        <h4>${labels.baselineName}</h4>
        <p class="compare-panel__meta">${labels.baselineMeta}</p>
        <ol class="paradigm-steps" data-paradigm-r-steps></ol>
      </div>
      <div class="playground__panel paradigm-panel paradigm-panel--dci" data-paradigm-d>
        <h4>${labels.agentName}</h4>
        <p class="compare-panel__meta">${labels.agentMeta}</p>
        <ol class="paradigm-steps" data-paradigm-d-steps></ol>
      </div>
    </div>
    <p class="playground__insight" data-paradigm-insight></p>
  `;

  const insights = labels.insights;

  const state = { step: 1, mode: 'both' };
  const stepSlider = container.querySelector('[data-paradigm-step]');
  const stepVal = container.querySelector('[data-paradigm-step-val]');
  const modeSel = container.querySelector('[data-paradigm-mode]');
  const rPanel = container.querySelector('[data-paradigm-r]');
  const dPanel = container.querySelector('[data-paradigm-d]');
  const rSteps = container.querySelector('[data-paradigm-r-steps]');
  const dSteps = container.querySelector('[data-paradigm-d-steps]');
  const insight = container.querySelector('[data-paradigm-insight]');

  const renderSteps = (steps, el, side) => {
    el.innerHTML = steps.map(s => {
      const active = s.step <= state.step;
      const current = s.step === state.step;
      return `<li class="paradigm-step ${active ? 'paradigm-step--active' : ''} ${current ? 'paradigm-step--current' : ''}">
        <span class="paradigm-step__num">${s.step}</span>
        <div>
          <strong>${s.action}</strong>
          <p>${s.detail}</p>
        </div>
      </li>`;
    }).join('');
    el.closest('.paradigm-panel').classList.toggle('paradigm-panel--dim', state.mode !== 'both' && state.mode !== side);
  };

  const render = () => {
    stepVal.textContent = state.step;
    renderSteps(retrieverSteps, rSteps, 'retriever');
    renderSteps(agentSteps, dSteps, 'dci');
    rPanel.style.display = state.mode === 'dci' ? 'none' : '';
    dPanel.style.display = state.mode === 'retriever' ? 'none' : '';
    insight.textContent = insights[state.step - 1] || '';
  };

  stepSlider.addEventListener('input', () => { state.step = parseInt(stepSlider.value, 10); render(); });
  modeSel.addEventListener('change', () => { state.mode = modeSel.value; render(); });
  render();
}
