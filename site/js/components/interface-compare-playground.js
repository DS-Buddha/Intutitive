/**
 * Interface A/B lab — baseline retriever vs agent interface side-by-side.
 */

import { getLabState, setLabState, subscribeLabState } from '../core/scenario-bus.js';
import { markPlaygroundUsed } from '../core/playground-events.js';
import { mergeLabels, COMPARE_LABELS } from './playground-labels.js';

export function mount(container, config = {}) {
  const scenarios = config.scenarios;
  const chunks = config.chunks;
  const rankByScenario = config.rankByScenario;
  const agentMatches = config.agentMatches || config.dciMatches;
  const syncBus = config.syncBus === true;
  const labels = mergeLabels(COMPARE_LABELS, config.labels);

  if (!scenarios?.length || !chunks?.length || !rankByScenario || !agentMatches) {
    container.textContent = 'Interface compare requires scenarios, chunks, rankByScenario, and agentMatches in lab-data.js';
    return;
  }

  container.className = 'playground playground--interface-compare';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">${labels.title}</h3>
      <p class="playground__subtitle">${labels.subtitle}${syncBus ? ' <em>(Synced across lab stations)</em>' : ''}</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group">
        <label class="playground__label">Question scenario</label>
        <select class="playground__select" data-compare-scenario></select>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Retriever top-k <span class="playground__value" data-compare-topk-val>3</span></label>
        <input type="range" min="1" max="8" value="3" data-compare-topk>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">${labels.agentControlLabel}</label>
        <select class="playground__select" data-compare-resolution>
          <option value="line">Line (grep)</option>
          <option value="passage">Passage (chunk read)</option>
          <option value="doc">Whole document</option>
        </select>
      </div>
    </div>
    <p class="compare-question" data-compare-question></p>
    <div class="compare-grid">
      <div class="playground__panel compare-panel compare-panel--retriever">
        <h4>${labels.baselineName}</h4>
        <p class="compare-panel__meta">${labels.baselineMeta}</p>
        <div data-compare-retriever></div>
        <div class="compare-verdict compare-verdict--fail" data-compare-r-verdict></div>
      </div>
      <div class="playground__panel compare-panel compare-panel--dci">
        <h4>${labels.agentName}</h4>
        <p class="compare-panel__meta">${labels.agentMeta}</p>
        <div class="compare-cmd" data-compare-cmd></div>
        <div data-compare-dci></div>
        <div class="compare-verdict compare-verdict--ok" data-compare-d-verdict></div>
      </div>
    </div>
    <p class="playground__insight" data-compare-insight></p>
  `;

  const state = { ...getLabState(), scenarioId: getLabState().scenarioId || scenarios[0].id };
  const els = {
    scenario: container.querySelector('[data-compare-scenario]'),
    topK: container.querySelector('[data-compare-topk]'),
    topKVal: container.querySelector('[data-compare-topk-val]'),
    resolution: container.querySelector('[data-compare-resolution]'),
    question: container.querySelector('[data-compare-question]'),
    retriever: container.querySelector('[data-compare-retriever]'),
    dci: container.querySelector('[data-compare-dci]'),
    cmd: container.querySelector('[data-compare-cmd]'),
    rVerdict: container.querySelector('[data-compare-r-verdict]'),
    dVerdict: container.querySelector('[data-compare-d-verdict]'),
    insight: container.querySelector('[data-compare-insight]'),
  };

  els.scenario.innerHTML = scenarios.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
  els.scenario.value = state.scenarioId;
  els.topK.value = state.topK;
  els.resolution.value = state.resolution;

  const emitState = () => {
    if (syncBus) setLabState({ scenarioId: state.scenarioId, topK: state.topK, resolution: state.resolution });
  };

  const formatCmd = (scenario) => {
    if (typeof config.formatAgentCmd === 'function') return config.formatAgentCmd(scenario);
    if (scenario.agentCmd) return scenario.agentCmd;
    return scenario.dciPipe
      ? `grep '${scenario.dciPattern}' | grep '${scenario.dciPipe}'`
      : `grep '${scenario.dciPattern}'`;
  };

  const render = () => {
    const scenario = scenarios.find(s => s.id === state.scenarioId);
    const ranked = rankByScenario(state.scenarioId, chunks);
    const kept = ranked.slice(0, state.topK);
    const keptIds = new Set(kept.map(c => c.id));
    const rGold = scenario.goldIds.filter(id => keptIds.has(id));
    const agentHits = agentMatches(state.scenarioId, chunks);
    const dGold = scenario.goldIds.filter(id => agentHits.some(h => h.id === id));

    els.question.innerHTML = `<strong>Agent question:</strong> ${scenario.question}`;
    els.topKVal.textContent = state.topK;

    els.retriever.innerHTML = kept.map((c, i) =>
      `<div class="compare-hit ${scenario.goldIds.includes(c.id) ? 'compare-hit--gold' : ''}">
        <span>#${i + 1}</span> <code>${c.score.toFixed(2)}</code>
        <p>${truncate(c.text, state.resolution === 'doc' ? 200 : 80)}</p>
      </div>`
    ).join('') || '<p class="playground__hint">Nothing retrieved.</p>';

    els.cmd.textContent = `$ ${formatCmd(scenario)}`;

    els.dci.innerHTML = agentHits.length
      ? agentHits.map(c => `<div class="compare-hit compare-hit--gold">
        <span>${c.file}:${c.line}</span>
        <p>${truncate(c.text, state.resolution === 'line' ? 999 : state.resolution === 'passage' ? 120 : 200)}</p>
      </div>`).join('')
      : '<p class="playground__hint">No agent matches — try another scenario.</p>';

    const rOk = rGold.length === scenario.goldIds.length;
    const dOk = dGold.length === scenario.goldIds.length;

    els.rVerdict.className = `compare-verdict ${rOk ? 'compare-verdict--ok' : 'compare-verdict--fail'}`;
    els.rVerdict.textContent = rOk
      ? '✓ Agent has enough evidence to answer'
      : `✗ Missing ${scenario.goldIds.length - rGold.length} gold chunk(s) — answer unreliable`;

    els.dVerdict.className = `compare-verdict ${dOk ? 'compare-verdict--ok' : 'compare-verdict--fail'}`;
    els.dVerdict.textContent = dOk
      ? labels.agentSuccessVerdict
      : labels.agentFailVerdict;

    els.insight.textContent = scenario.insight;
  };

  els.scenario.addEventListener('change', () => { markPlaygroundUsed('compare'); state.scenarioId = els.scenario.value; emitState(); render(); });
  els.topK.addEventListener('input', () => { markPlaygroundUsed('compare'); state.topK = parseInt(els.topK.value, 10); emitState(); render(); });
  els.resolution.addEventListener('change', () => { markPlaygroundUsed('compare'); state.resolution = els.resolution.value; emitState(); render(); });

  if (syncBus) {
    subscribeLabState(bus => {
      state.scenarioId = bus.scenarioId;
      state.topK = bus.topK;
      state.resolution = bus.resolution;
      els.scenario.value = state.scenarioId;
      els.topK.value = state.topK;
      els.resolution.value = state.resolution;
      render();
    });
  }

  render();
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
