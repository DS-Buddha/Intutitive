/**
 * Paradigm compare — Figure 2 retriever-mediated vs DCI trajectory morph.
 */

export function mount(container, config = {}) {
  const retrieverSteps = config.retrieverSteps;
  const dciSteps = config.dciSteps;

  if (!retrieverSteps?.length || !dciSteps?.length) {
    container.textContent = 'Paradigm compare requires retrieverSteps and dciSteps in lab-data.js';
    return;
  }

  container.className = 'playground playground--paradigm';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Two paradigms (Figure 2)</h3>
      <p class="playground__subtitle">Same agent goal — different retrieval interface. Step through each trajectory.</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group">
        <label class="playground__label">Step <span class="playground__value" data-paradigm-step-val>1</span> / 4</label>
        <input type="range" min="1" max="4" value="1" data-paradigm-step>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Highlight</label>
        <select class="playground__select" data-paradigm-mode>
          <option value="both">Both side by side</option>
          <option value="retriever">Retriever only</option>
          <option value="dci">DCI only</option>
        </select>
      </div>
    </div>
    <div class="paradigm-grid">
      <div class="playground__panel paradigm-panel paradigm-panel--retriever" data-paradigm-r>
        <h4>Retriever-mediated</h4>
        <p class="compare-panel__meta">Offline index · top-k API</p>
        <ol class="paradigm-steps" data-paradigm-r-steps></ol>
      </div>
      <div class="playground__panel paradigm-panel paradigm-panel--dci" data-paradigm-d>
        <h4>Direct corpus interaction</h4>
        <p class="compare-panel__meta">Raw files · grep, read, pipe</p>
        <ol class="paradigm-steps" data-paradigm-d-steps></ol>
      </div>
    </div>
    <p class="playground__insight" data-paradigm-insight></p>
  `;

  const insights = [
    'Both start with the same user question — the interface diverges immediately.',
    'Retriever compresses corpus access into one ranked API call. Agent cannot refine.',
    'DCI composes weak lexical clues — each step narrows the search space.',
    'Final step: retriever gives snippets; DCI gives verified line-level evidence.',
  ];

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
    renderSteps(dciSteps, dSteps, 'dci');
    rPanel.style.display = state.mode === 'dci' ? 'none' : '';
    dPanel.style.display = state.mode === 'retriever' ? 'none' : '';
    insight.textContent = insights[state.step - 1] || '';
  };

  stepSlider.addEventListener('input', () => { state.step = parseInt(stepSlider.value, 10); render(); });
  modeSel.addEventListener('change', () => { state.mode = modeSel.value; render(); });
  render();
}
