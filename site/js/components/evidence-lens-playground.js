/**
 * Evidence lens — interactive benchmark tables from paper §4.
 */

import { evidenceBenchmarks } from '../topics/papers/dci-agent/journey-data.js';

export function mount(container, config = {}) {
  const benchmarks = config.benchmarks || evidenceBenchmarks;

  container.className = 'playground playground--evidence';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Evidence lens</h3>
      <p class="playground__subtitle">Pick a benchmark. Predict the winner before revealing paper numbers.</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group">
        <label class="playground__label">Benchmark</label>
        <select class="playground__select" data-ev-benchmark></select>
      </div>
      <div class="playground__control-group">
        <label class="playground__label">Your prediction</label>
        <select class="playground__select" data-ev-predict>
          <option value="">— predict before reveal —</option>
        </select>
      </div>
      <button type="button" class="btn btn--secondary btn--sm" data-ev-reveal>Reveal paper results</button>
    </div>
    <div class="evidence-chart" data-ev-chart></div>
    <p class="evidence-predict-msg" data-ev-predict-msg hidden></p>
    <p class="playground__insight" data-ev-insight></p>
  `;

  const state = { benchmarkId: benchmarks[0].id, prediction: '', revealed: false };
  const benchSel = container.querySelector('[data-ev-benchmark]');
  const predictSel = container.querySelector('[data-ev-predict]');
  const revealBtn = container.querySelector('[data-ev-reveal]');
  const chart = container.querySelector('[data-ev-chart]');
  const predictMsg = container.querySelector('[data-ev-predict-msg]');
  const insight = container.querySelector('[data-ev-insight]');

  benchSel.innerHTML = benchmarks.map(b =>
    `<option value="${b.id}">${b.label} (${b.paperSection})</option>`
  ).join('');

  const render = () => {
    const bench = benchmarks.find(b => b.id === state.benchmarkId);
    state.revealed = false;
    predictMsg.hidden = true;

    predictSel.innerHTML = `<option value="">— predict before reveal —</option>` +
      bench.baselines.map(b => `<option value="${b.name}">${b.name}</option>`).join('');

    chart.innerHTML = `
      <table class="paper-table evidence-table">
        <thead><tr><th>System</th><th>Score</th>${bench.baselines.some(b => b.cost) ? '<th>Cost ($)</th>' : ''}</tr></thead>
        <tbody>
          ${bench.baselines.map(b => `
            <tr class="evidence-row" data-ev-row="${b.name}">
              <td>${b.name}</td>
              <td><span class="evidence-score" data-ev-score="${b.name}">?</span></td>
              ${bench.baselines.some(x => x.cost) ? `<td>${b.cost != null ? `<span data-ev-cost="${b.name}">?</span>` : '—'}</td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    insight.textContent = 'Make a prediction, then reveal.';
    revealBtn.textContent = 'Reveal paper results';
  };

  const reveal = () => {
    const bench = benchmarks.find(b => b.id === state.benchmarkId);
    state.revealed = true;

    bench.baselines.forEach(b => {
      const scoreEl = chart.querySelector(`[data-ev-score="${b.name}"]`);
      if (scoreEl) scoreEl.textContent = `${b.accuracy}%`;
      const costEl = chart.querySelector(`[data-ev-cost="${b.name}"]`);
      if (costEl) costEl.textContent = b.cost.toLocaleString();

      const row = chart.querySelector(`[data-ev-row="${b.name}"]`);
      const isWinner = b.accuracy === Math.max(...bench.baselines.map(x => x.accuracy));
      row?.classList.toggle('evidence-row--winner', isWinner);
    });

    const winner = bench.baselines.reduce((a, b) => b.accuracy > a.accuracy ? b : a);
    if (state.prediction) {
      const correct = state.prediction === winner.name;
      predictMsg.hidden = false;
      predictMsg.className = `evidence-predict-msg ${correct ? 'evidence-predict-msg--ok' : 'evidence-predict-msg--miss'}`;
      predictMsg.textContent = correct
        ? `✓ You predicted ${winner.name} — matches the paper.`
        : `You picked ${state.prediction}. Paper winner: ${winner.name}. ${bench.insight}`;
    }
    insight.textContent = bench.insight;
    revealBtn.textContent = 'Hide results';
  };

  benchSel.addEventListener('change', () => {
    state.benchmarkId = benchSel.value;
    state.prediction = '';
    render();
  });

  predictSel.addEventListener('change', () => { state.prediction = predictSel.value; });

  revealBtn.addEventListener('click', () => {
    if (state.revealed) render();
    else reveal();
  });

  render();
}
