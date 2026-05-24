/**
 * Assumption breaker — toggle paper assumptions, flip claimed wins to struggles.
 */

import { trackProgressArray, setProgress, KEYS } from '../core/lab-progress.js';

export function mount(container, config = {}) {
  const items = config.assumptions;
  const assumptionToSeed = config.assumptionToSeed || {};
  const paperLabel = config.paperLabel || 'the paper';

  if (!items?.length) {
    container.textContent = 'Assumption breaker requires config.assumptions in lab-data.js';
    return;
  }

  container.className = 'playground playground--assumption playground--interactive';
  container.innerHTML = `
    <div class="playground__header playground__header--accent playground__header--assumption">
      <div class="playground__header-icon" aria-hidden="true">⚡</div>
      <div>
        <h3 class="playground__title">Assumption breaker</h3>
        <p class="playground__subtitle">Turn assumptions off one at a time — see where ${paperLabel} stops winning. Broken scenarios feed Ideas workshop below.</p>
      </div>
    </div>
    <div class="assumption-toggles" data-assumption-toggles></div>
    <div class="assumption-chips" data-assumption-chips hidden></div>
    <div class="assumption-scenario playground__panel" data-assumption-scenario>
      <p class="playground__hint">All assumptions hold — ${paperLabel} wins on its home scenarios. Turn one off.</p>
    </div>
    <p class="assumption-question"><strong>Would you still choose this approach here? Why?</strong></p>
    <p class="playground__insight" data-assumption-verdict></p>
  `;

  const state = Object.fromEntries(items.map(a => [a.id, a.defaultOn]));
  let activeBrokenId = null;

  const togglesEl = container.querySelector('[data-assumption-toggles]');
  const chipsEl = container.querySelector('[data-assumption-chips]');
  const scenarioEl = container.querySelector('[data-assumption-scenario]');
  const verdictEl = container.querySelector('[data-assumption-verdict]');

  togglesEl.innerHTML = items.map(a => `
    <label class="assumption-toggle">
      <input type="checkbox" data-assumption-id="${a.id}" ${a.defaultOn ? 'checked' : ''}>
      <span><strong>${a.label}</strong><br><small>${a.description}</small></span>
    </label>
  `).join('');

  const getBroken = () => items.filter(a => !state[a.id]);

  const persistBroken = (broken) => {
    setProgress(KEYS.brokenAssumptions, JSON.stringify(broken.map(a => ({
      id: a.id,
      label: a.label,
      verdict: a.breakScenario.verdict,
      title: a.breakScenario.title,
      seedId: assumptionToSeed[a.id] || null,
    }))));
    document.dispatchEvent(new CustomEvent('dci:assumptions-changed', {
      detail: { broken: broken.map(a => a.id) },
    }));
  };

  const renderScenario = (assumption) => {
    const s = assumption.breakScenario;
    scenarioEl.innerHTML = `
      <h4>${s.title}</h4>
      <p class="text-secondary">Broken assumption: <em>${assumption.label}</em></p>
      <div class="assumption-outcomes">
        <div class="assumption-outcome assumption-outcome--${s.dciOutcome}">${paperLabel}: ${s.dciOutcome}</div>
        <div class="assumption-outcome assumption-outcome--${s.retrieverOutcome}">Baseline: ${s.retrieverOutcome}</div>
      </div>
    `;
    verdictEl.textContent = s.verdict;
  };

  const renderChips = (broken) => {
    if (!broken.length) {
      chipsEl.hidden = true;
      chipsEl.innerHTML = '';
      return;
    }
    chipsEl.hidden = false;
    chipsEl.innerHTML = `
      <span class="assumption-chips__label">Broken assumptions — click to review:</span>
      ${broken.map(a => `
        <button type="button" class="assumption-chip ${activeBrokenId === a.id ? 'assumption-chip--active' : ''}" data-chip-id="${a.id}">
          ${a.label}
        </button>
      `).join('')}
    `;
    chipsEl.querySelectorAll('[data-chip-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeBrokenId = btn.dataset.chipId;
        const item = items.find(i => i.id === activeBrokenId);
        if (item) renderScenario(item);
        renderChips(broken);
      });
    });
  };

  const render = () => {
    const broken = getBroken();
    persistBroken(broken);

    if (broken.length === 0) {
      activeBrokenId = null;
      scenarioEl.innerHTML = `
        <div class="assumption-outcome assumption-outcome--dci">
          <span>${paperLabel}</span> wins · <span>Baseline</span> struggles
        </div>
        <p>All paper assumptions hold — this is ${paperLabel}'s home turf.</p>
      `;
      verdictEl.textContent = `All paper assumptions hold. This is where ${paperLabel} shines.`;
      renderChips(broken);
      return;
    }

    if (!activeBrokenId || !broken.some(a => a.id === activeBrokenId)) {
      activeBrokenId = broken[broken.length - 1].id;
    }

    const active = items.find(a => a.id === activeBrokenId);
    if (active) renderScenario(active);
    renderChips(broken);
  };

  togglesEl.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      const id = input.dataset.assumptionId;
      state[id] = input.checked;
      if (!input.checked) {
        trackProgressArray(KEYS.stress, id);
        document.dispatchEvent(new CustomEvent('dci:assumption-explored', { detail: { id } }));
      }
      render();
    });
  });

  render();
}
