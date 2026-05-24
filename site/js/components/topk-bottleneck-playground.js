/**
 * Top-k bottleneck — tune k and watch gold evidence get lost.
 */

import { getLabState, setLabState, subscribeLabState } from '../core/scenario-bus.js';
import { markPlaygroundUsed } from '../core/playground-events.js';

export function mount(container, config = {}) {
  const scenarios = config.scenarios;
  const chunks = config.chunks;
  const rankByScenario = config.rankByScenario;
  const syncBus = config.syncBus === true;

  if (!scenarios?.length || !chunks?.length || !rankByScenario) {
    container.textContent = 'Top-k bottleneck requires scenarios, chunks, and rankByScenario in lab-data.js';
    return;
  }

  container.className = 'playground playground--topk';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Top-k bottleneck</h3>
      <p class="playground__subtitle">Drag <strong>top-k</strong> down. Watch the gold chunk drop out — no second chance for the agent.${syncBus ? ' <em>(Synced with other stations)</em>' : ''}</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group">
        <label class="playground__label">Scenario</label>
        <select class="playground__select" data-topk-scenario></select>
      </div>
      <div class="playground__control-group playground__control-group--wide">
        <label class="playground__label">Top-k <span class="playground__value" data-topk-val>5</span></label>
        <input type="range" min="1" max="10" value="5" data-topk-slider>
      </div>
    </div>
    <div class="topk-viz">
      <div class="playground__panel">
        <span class="playground__label">Full corpus (${chunks.length} chunks)</span>
        <div class="topk-corpus" data-topk-corpus></div>
      </div>
      <div class="topk-funnel-arrow">↓ retriever keeps top-k only ↓</div>
      <div class="playground__panel">
        <span class="playground__label">What the agent sees</span>
        <div class="topk-agent-view" data-topk-agent></div>
      </div>
    </div>
    <p class="playground__insight" data-topk-insight></p>
  `;

  const state = { scenarioId: getLabState().scenarioId || scenarios[0].id, topK: getLabState().topK || 5 };
  const scenarioSelect = container.querySelector('[data-topk-scenario]');
  const slider = container.querySelector('[data-topk-slider]');
  const topKVal = container.querySelector('[data-topk-val]');
  const corpusEl = container.querySelector('[data-topk-corpus]');
  const agentEl = container.querySelector('[data-topk-agent]');
  const insight = container.querySelector('[data-topk-insight]');

  scenarioSelect.innerHTML = scenarios.map(s =>
    `<option value="${s.id}">${s.label}</option>`
  ).join('');
  scenarioSelect.value = state.scenarioId;
  slider.value = state.topK;

  const emitState = () => {
    if (syncBus) setLabState({ scenarioId: state.scenarioId, topK: state.topK });
  };

  const render = () => {
    const scenario = scenarios.find(s => s.id === state.scenarioId);
    const ranked = rankByScenario(state.scenarioId, chunks);
    const kept = ranked.slice(0, state.topK);
    const keptIds = new Set(kept.map(c => c.id));
    const goldInKept = scenario.goldIds.every(id => keptIds.has(id));

    corpusEl.innerHTML = ranked.map((c, i) => {
      const isGold = scenario.goldIds.includes(c.id);
      const inTopK = i < state.topK;
      const cls = isGold ? 'topk-chunk topk-chunk--gold' : 'topk-chunk';
      const status = inTopK ? 'kept' : 'lost';
      return `<div class="${cls} topk-chunk--${status}" data-rank="${i + 1}">
        <span class="topk-chunk__rank">#${i + 1}</span>
        <span class="topk-chunk__label">${c.label}</span>
        <span class="topk-chunk__score">${c.score.toFixed(2)}</span>
        <p class="topk-chunk__text">${c.text}</p>
        ${isGold ? '<span class="topk-chunk__badge">★ gold</span>' : ''}
        ${!inTopK && isGold ? '<span class="topk-chunk__badge topk-chunk__badge--lost">LOST</span>' : ''}
      </div>`;
    }).join('');

    agentEl.innerHTML = kept.length
      ? kept.map((c, i) => `<div class="topk-chunk topk-chunk--kept ${scenario.goldIds.includes(c.id) ? 'topk-chunk--gold' : ''}">
        <span>#${i + 1}</span> ${c.label}: ${c.text.slice(0, 60)}…
      </div>`).join('')
      : '<p class="playground__hint">No chunks pass through.</p>';

    topKVal.textContent = state.topK;
    insight.innerHTML = goldInKept
      ? `<strong>Gold evidence reachable</strong> at k=${state.topK}. Agent can potentially answer: "${scenario.question}"`
      : `<strong>Gold evidence LOST</strong> at k=${state.topK}. Rank of first gold: #${ranked.findIndex(c => scenario.goldIds.includes(c.id)) + 1}. Agent will hallucinate or guess.`;
  };

  scenarioSelect.addEventListener('change', () => { markPlaygroundUsed('topk'); state.scenarioId = scenarioSelect.value; emitState(); render(); });
  slider.addEventListener('input', () => { markPlaygroundUsed('topk'); state.topK = parseInt(slider.value, 10); emitState(); render(); });

  if (syncBus) {
    subscribeLabState(bus => {
      state.scenarioId = bus.scenarioId;
      state.topK = bus.topK;
      scenarioSelect.value = state.scenarioId;
      slider.value = state.topK;
      render();
    });
  }

  render();
}
