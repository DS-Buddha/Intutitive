/**
 * Coverage vs localization — tune agent strategy knobs.
 */

import { labChunks, labScenarios, rankByScenario, dciMatches } from '../topics/papers/dci-agent/dci-scenarios.js';
import { getLabState, setLabState, subscribeLabState } from '../core/scenario-bus.js';

export function mount(container, config = {}) {
  const scenarios = config.scenarios || labScenarios;
  const chunks = config.chunks || labChunks;
  const syncBus = config.syncBus === true;

  container.className = 'playground playground--metrics';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Coverage vs localization</h3>
      <p class="playground__subtitle">Tune strategy knobs. DCI often matches retriever on coverage but wins on localization — finer evidence for verification.${syncBus ? ' <em>(Scenario synced)</em>' : ''}</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group">
        <label class="playground__label">Scenario</label>
        <select class="playground__select" data-metrics-scenario></select>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Interface</label>
        <div class="playground__toggle" role="group">
          <button type="button" class="playground__toggle-btn" data-mode="retriever" aria-pressed="true">Retriever</button>
          <button type="button" class="playground__toggle-btn" data-mode="dci" aria-pressed="false">DCI</button>
        </div>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Top-k (retriever only) <span class="playground__value" data-metrics-topk-val>5</span></label>
        <input type="range" min="1" max="10" value="5" data-metrics-topk>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Verify depth (DCI only) <span class="playground__value" data-metrics-depth-val>line</span></label>
        <input type="range" min="0" max="2" value="2" data-metrics-depth>
      </div>
    </div>
    <div class="metrics-bars">
      <div class="metrics-bar-row">
        <span>Coverage</span>
        <div class="metrics-bar"><div class="metrics-bar__fill metrics-bar__fill--cov" data-bar-cov></div></div>
        <span data-val-cov>0%</span>
      </div>
      <div class="metrics-bar-row">
        <span>Localization</span>
        <div class="metrics-bar"><div class="metrics-bar__fill metrics-bar__fill--loc" data-bar-loc></div></div>
        <span data-val-loc>0%</span>
      </div>
    </div>
    <div class="playground__panel">
      <span class="playground__label">Evidence exposed to agent</span>
      <div data-metrics-evidence></div>
    </div>
    <p class="playground__insight" data-metrics-insight></p>
  `;

  const depthLabels = ['document', 'passage', 'line'];
  const state = {
    scenarioId: getLabState().scenarioId || scenarios[0].id,
    mode: 'retriever',
    topK: getLabState().topK || 5,
    depth: 2,
  };

  const scenarioSel = container.querySelector('[data-metrics-scenario]');
  scenarioSel.innerHTML = scenarios.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
  scenarioSel.value = state.scenarioId;
  container.querySelector('[data-metrics-topk]').value = state.topK;

  const emitState = () => {
    if (syncBus) setLabState({ scenarioId: state.scenarioId, topK: state.topK });
  };

  const render = () => {
    const scenario = scenarios.find(s => s.id === state.scenarioId);
    const goldCount = scenario.goldIds.length;

    let coverage = 0;
    let localization = 0;
    let evidenceHtml = '';

    if (state.mode === 'retriever') {
      const ranked = rankByScenario(state.scenarioId, chunks);
      const kept = ranked.slice(0, state.topK);
      const goldHit = scenario.goldIds.filter(id => kept.some(c => c.id === id));
      coverage = Math.round((goldHit.length / goldCount) * 100);
      // localization: avg snippet length vs full doc — lower = worse (whole chunk ~100 chars avg)
      const locScores = goldHit.map(id => {
        const c = chunks.find(x => x.id === id);
        const snippetLen = Math.min(80, c.text.length);
        return Math.round((snippetLen / Math.max(c.text.length, 1)) * 40); // capped low for retriever
      });
      localization = locScores.length ? Math.round(locScores.reduce((a, b) => a + b, 0) / locScores.length) : 0;
      evidenceHtml = kept.map(c =>
        `<div class="metrics-evidence ${scenario.goldIds.includes(c.id) ? 'metrics-evidence--gold' : ''}">${c.text.slice(0, 80)}…</div>`
      ).join('');
    } else {
      const hits = dciMatches(state.scenarioId, chunks);
      const goldHit = scenario.goldIds.filter(id => hits.some(h => h.id === id));
      coverage = Math.round((goldHit.length / goldCount) * 100);
      const depthFactor = [30, 55, 95][state.depth];
      localization = goldHit.length ? depthFactor : 0;
      evidenceHtml = hits.map(c =>
        `<div class="metrics-evidence metrics-evidence--gold"><code>${c.file}:${c.line}</code> ${c.text}</div>`
      ).join('') || '<p class="playground__hint">No matches.</p>';
    }

    container.querySelector('[data-bar-cov]').style.width = `${coverage}%`;
    container.querySelector('[data-bar-loc]').style.width = `${localization}%`;
    container.querySelector('[data-val-cov]').textContent = `${coverage}%`;
    container.querySelector('[data-val-loc]').textContent = `${localization}%`;
    container.querySelector('[data-metrics-evidence]').innerHTML = evidenceHtml;
    container.querySelector('[data-metrics-topk-val]').textContent = state.topK;
    container.querySelector('[data-metrics-depth-val]').textContent = depthLabels[state.depth];

    container.querySelector('[data-metrics-insight]').textContent = state.mode === 'dci'
      ? 'DCI localizes exact lines for verification — even when coverage matches retriever, answer quality improves.'
      : 'Retriever may find the right file but expose a coarse snippet — lower localization score.';
  };

  scenarioSel.addEventListener('change', () => { state.scenarioId = scenarioSel.value; emitState(); render(); });
  container.querySelector('[data-metrics-topk]').addEventListener('input', e => {
    state.topK = parseInt(e.target.value, 10); emitState(); render();
  });
  container.querySelector('[data-metrics-depth]').addEventListener('input', e => {
    state.depth = parseInt(e.target.value, 10); render();
  });
  container.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode = btn.getAttribute('data-mode');
      container.querySelectorAll('[data-mode]').forEach(b =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      render();
    });
  });
  if (syncBus) {
    subscribeLabState(bus => {
      state.scenarioId = bus.scenarioId;
      state.topK = bus.topK;
      scenarioSel.value = state.scenarioId;
      container.querySelector('[data-metrics-topk]').value = state.topK;
      render();
    });
  }

  render();
}
