/**
 * Assumption breaker — toggle paper assumptions, flip DCI wins to struggles.
 */

import { assumptions } from '../topics/papers/dci-agent/journey-data.js';

export function mount(container, config = {}) {
  const items = config.assumptions || assumptions;

  container.className = 'playground playground--assumption';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Assumption breaker</h3>
      <p class="playground__subtitle">The paper assumes certain conditions. Turn one off — see where DCI stops winning.</p>
    </div>
    <div class="assumption-toggles" data-assumption-toggles></div>
    <div class="assumption-scenario playground__panel" data-assumption-scenario>
      <p class="playground__hint">All assumptions hold — DCI wins on lexical precision scenarios. Turn one off.</p>
    </div>
    <p class="assumption-question"><strong>Would you still choose DCI here? Why?</strong></p>
    <p class="playground__insight" data-assumption-verdict></p>
  `;

  const state = Object.fromEntries(items.map(a => [a.id, a.defaultOn]));
  const togglesEl = container.querySelector('[data-assumption-toggles]');
  const scenarioEl = container.querySelector('[data-assumption-scenario]');
  const verdictEl = container.querySelector('[data-assumption-verdict]');

  togglesEl.innerHTML = items.map(a => `
    <label class="assumption-toggle">
      <input type="checkbox" data-assumption-id="${a.id}" ${a.defaultOn ? 'checked' : ''}>
      <span><strong>${a.label}</strong><br><small>${a.description}</small></span>
    </label>
  `).join('');

  const explored = new Set();

  const render = () => {
    const broken = items.filter(a => !state[a.id]);
    if (broken.length === 0) {
      scenarioEl.innerHTML = `
        <div class="assumption-outcome assumption-outcome--dci">
          <span>DCI</span> wins · <span>Retriever</span> struggles
        </div>
        <p>Exact SKU lookup, piped grep, error codes — DCI localizes evidence the retriever loses at low k.</p>
      `;
      verdictEl.textContent = 'All paper assumptions hold. This is DCI\'s home turf.';
      return;
    }

    const active = broken[broken.length - 1];
    const s = active.breakScenario;
    explored.add(active.id);
    document.dispatchEvent(new CustomEvent('dci:assumption-explored', { detail: { id: active.id } }));

    scenarioEl.innerHTML = `
      <h4>${s.title}</h4>
      <p class="text-secondary">Broken assumption: <em>${active.label}</em></p>
      <div class="assumption-outcomes">
        <div class="assumption-outcome assumption-outcome--${s.dciOutcome}">DCI: ${s.dciOutcome}</div>
        <div class="assumption-outcome assumption-outcome--${s.retrieverOutcome}">Retriever: ${s.retrieverOutcome}</div>
      </div>
    `;
    verdictEl.textContent = s.verdict;
  };

  togglesEl.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      state[input.dataset.assumptionId] = input.checked;
      render();
    });
  });

  render();
}
