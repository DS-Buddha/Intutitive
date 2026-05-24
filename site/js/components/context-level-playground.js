/**
 * Context level playground — L0–L4 context management from paper §3.
 */

import { contextLevels } from '../topics/papers/dci-agent/journey-data.js';

const MOCK_TRAJECTORY = [
  { tool: 'grep', output: 'contracts.txt:3: SKU-8842 valve warranty: 24 months', chars: 52 },
  { tool: 'read', output: 'Full contracts.txt (4 lines) loaded into context…', chars: 4200 },
  { tool: 'grep', output: 'breach_register.csv:2: Acme Corp,2024-06-01,material_breach', chars: 58 },
  { tool: 'read', output: 'support_faq.md (2 lines) — warranty extension policy…', chars: 3100 },
  { tool: 'grep', output: 'earnings_q3.txt:1: Q3 revenue $4.8B…', chars: 1800 },
  { tool: 'read', output: 'contracts.txt re-read after pipe refinement…', chars: 4200 },
];

export function mount(container, config = {}) {
  const levels = config.levels || contextLevels;
  const trajectory = config.trajectory || MOCK_TRAJECTORY;

  container.className = 'playground playground--context-level';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Context management (L0–L4)</h3>
      <p class="playground__subtitle">Long agent trajectories fill context fast. Toggle levels — watch what the agent still remembers.</p>
    </div>
    <div class="playground__controls">
      <div class="playground__control-group">
        <label class="playground__label">Context level</label>
        <select class="playground__select" data-ctx-level></select>
      </div>
    </div>
    <div class="ctx-stats">
      <div class="ctx-stat"><span>Raw trajectory</span> <strong data-ctx-raw>0</strong> chars</div>
      <div class="ctx-stat"><span>After policy</span> <strong data-ctx-after>0</strong> chars</div>
      <div class="ctx-stat"><span>Steps visible</span> <strong data-ctx-visible>0</strong> / ${trajectory.length}</div>
    </div>
    <div class="ctx-bar"><div class="ctx-bar__fill" data-ctx-bar></div></div>
    <div class="playground__panel">
      <span class="playground__label">Agent context window</span>
      <div class="ctx-trajectory" data-ctx-trajectory></div>
    </div>
    <p class="playground__insight" data-ctx-insight></p>
  `;

  const levelSel = container.querySelector('[data-ctx-level]');
  levelSel.innerHTML = levels.map(l => `<option value="${l.id}">${l.label}</option>`).join('');

  const els = {
    raw: container.querySelector('[data-ctx-raw]'),
    after: container.querySelector('[data-ctx-after]'),
    visible: container.querySelector('[data-ctx-visible]'),
    bar: container.querySelector('[data-ctx-bar]'),
    trajectory: container.querySelector('[data-ctx-trajectory]'),
    insight: container.querySelector('[data-ctx-insight]'),
  };

  const applyLevel = (level) => {
    let steps = trajectory.map((s, i) => ({ ...s, index: i }));
    const rawChars = steps.reduce((n, s) => n + s.chars, 0);

    if (level.compaction) {
      const seen = new Map();
      steps = steps.filter(s => {
        if (s.tool !== 'read') return true;
        const key = s.output.split(' ')[0];
        if (seen.has(key)) return false;
        seen.set(key, true);
        return true;
      });
    }

    if (level.summarization) {
      steps = steps.map((s, i) => {
        if (i < steps.length - 2 && s.tool === 'grep') {
          return { ...s, output: `[summarized] ${s.tool} step ${i + 1}: pattern matched`, chars: 40 };
        }
        return s;
      });
    }

    let total = steps.reduce((n, s) => n + s.chars, 0);
    const max = level.maxChars;

    if (level.truncation && max && total > max) {
      let budget = max;
      const kept = [];
      for (let i = steps.length - 1; i >= 0; i--) {
        if (budget - steps[i].chars >= 0) {
          kept.unshift(steps[i]);
          budget -= steps[i].chars;
        }
      }
      steps = kept;
      total = steps.reduce((n, s) => n + s.chars, 0);
    }

    return { steps, rawChars, total, max: max || rawChars };
  };

  const render = () => {
    const level = levels.find(l => l.id === levelSel.value) || levels[0];
    const { steps, rawChars, total, max } = applyLevel(level);

    els.raw.textContent = rawChars.toLocaleString();
    els.after.textContent = total.toLocaleString();
    els.visible.textContent = steps.length;
    els.bar.style.width = `${Math.min(100, (total / max) * 100)}%`;
    els.bar.classList.toggle('ctx-bar__fill--warn', level.truncation && total >= max * 0.9);

    els.trajectory.innerHTML = steps.length
      ? steps.map(s => `<div class="ctx-step ctx-step--${s.tool}">
        <span class="ctx-step__tool">${s.tool}</span>
        <p>${s.output}</p>
        <span class="ctx-step__chars">${s.chars} chars</span>
      </div>`).join('')
      : '<p class="playground__hint">Context empty — truncation removed all steps.</p>';

    els.insight.textContent = level.note;
  };

  levelSel.addEventListener('change', render);
  levelSel.value = 'L2';
  render();
}
