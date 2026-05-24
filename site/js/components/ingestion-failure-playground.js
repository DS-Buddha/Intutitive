/**
 * Ingestion failure chain — toggle pipeline steps to see downstream impact.
 */

export function mount(container, config = {}) {
  const steps = config.steps || [];
  container.className = 'playground playground--ingestion-failure';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Failure chain sandbox</h3>
      <p class="playground__subtitle">Turn off ingestion quality step-by-step. See how bad parsing poisons chunking, retrieval, and answers.</p>
    </div>
    <div class="failure-chain-controls" data-failure-controls></div>
    <div class="failure-chain-viz" data-failure-viz></div>
    <div class="playground__panel">
      <span class="playground__label">Simulated user experience</span>
      <div class="failure-outcome" data-failure-outcome></div>
    </div>
  `;

  const state = { enabled: Object.fromEntries(steps.map(s => [s.id, true])) };
  const controls = container.querySelector('[data-failure-controls]');
  const viz = container.querySelector('[data-failure-viz]');
  const outcome = container.querySelector('[data-failure-outcome]');

  controls.innerHTML = steps.map(s => `
    <label class="failure-toggle">
      <input type="checkbox" data-step="${s.id}" checked>
      <span>${s.label}</span>
    </label>
  `).join('');

  const render = () => {
    let broken = false;
    viz.innerHTML = steps.map((s, i) => {
      const ok = state.enabled[s.id] && !broken;
      if (!ok) broken = true;
      const cls = ok ? 'failure-step--ok' : 'failure-step--broken';
      return `
        <div class="failure-step ${cls}">
          <span class="failure-step__num">${i + 1}</span>
          <div><strong>${s.label}</strong><p>${ok ? s.okDesc : s.failDesc}</p></div>
        </div>
        ${i < steps.length - 1 ? '<div class="failure-step__arrow">↓</div>' : ''}`;
    }).join('');

    const allOk = steps.every(s => state.enabled[s.id]);
    const firstOff = steps.find(s => !state.enabled[s.id]);
    outcome.innerHTML = allOk
      ? `<div class="callout callout--success"><strong>Grounded answer:</strong> ${config.successAnswer || 'Answer cites correct source.'}</div>`
      : `<div class="callout callout--danger"><strong>Broken at:</strong> ${firstOff?.label}. ${config.failureAnswer || 'LLM hallucinates or cites wrong region.'}</div>`;
  };

  controls.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('change', () => {
      state.enabled[inp.getAttribute('data-step')] = inp.checked;
      render();
    });
  });

  render();
}
