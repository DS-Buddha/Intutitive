/**
 * Agentic verification — planner → retriever → reflection loop.
 */

export function mount(container, config = {}) {
  const steps = config.steps || [];
  container.className = 'playground playground--agentic';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Agentic loop sandbox</h3>
      <p class="playground__subtitle">Step through planner, retriever, and reflection. See when the agent re-queries vs accepts evidence.</p>
    </div>
    <div class="agentic-controls">
      <button type="button" class="btn btn--secondary" data-agentic-prev>← Prev</button>
      <button type="button" class="btn btn--primary" data-agentic-next>Next step →</button>
      <button type="button" class="btn btn--ghost" data-agentic-reset>Reset</button>
    </div>
    <div class="agentic-stepper" data-agentic-stepper></div>
    <div class="playground__panel">
      <span class="playground__label">Current step detail</span>
      <div class="agentic-detail" data-agentic-detail></div>
    </div>
    <div class="playground__panel">
      <span class="playground__label">Evidence state</span>
      <div data-agentic-evidence></div>
    </div>
  `;

  let idx = 0;
  const evidence = [];
  const stepper = container.querySelector('[data-agentic-stepper]');
  const detail = container.querySelector('[data-agentic-detail]');
  const evidenceEl = container.querySelector('[data-agentic-evidence]');

  const render = () => {
    stepper.innerHTML = steps.map((s, i) => `
      <div class="agentic-step ${i === idx ? 'agentic-step--active' : ''} ${i < idx ? 'agentic-step--done' : ''}">
        <span class="agentic-step__icon">${s.icon || '●'}</span>
        <span>${s.phase}</span>
      </div>
    `).join('');

    const step = steps[idx];
    detail.innerHTML = `
      <h4>${step.phase}</h4>
      <p>${step.description}</p>
      ${step.output ? `<div class="callout"><strong>Output:</strong> ${step.output}</div>` : ''}
      ${step.decision ? `<p class="playground__insight"><strong>Decision:</strong> ${step.decision}</p>` : ''}`;

    if (step.evidenceAdd) evidence.push(...step.evidenceAdd);
    evidenceEl.innerHTML = evidence.length
      ? evidence.map(e => `<div class="agentic-evidence-item"><strong>${e.source}</strong><p>${e.text}</p></div>`).join('')
      : '<p class="playground__hint">Evidence accumulates as the loop runs.</p>';
  };

  container.querySelector('[data-agentic-next]').addEventListener('click', () => {
    if (idx < steps.length - 1) { idx++; render(); }
  });
  container.querySelector('[data-agentic-prev]').addEventListener('click', () => {
    if (idx > 0) { idx--; evidence.length = 0; steps.slice(0, idx + 1).forEach(s => { if (s.evidenceAdd) evidence.push(...s.evidenceAdd); }); render(); }
  });
  container.querySelector('[data-agentic-reset]').addEventListener('click', () => {
    idx = 0; evidence.length = 0; render();
  });

  render();
}
