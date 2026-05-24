/**
 * Test-time scaling — config-driven steps vs reasoning effort curves.
 */

import { markPlaygroundUsed } from '../core/playground-events.js';
import { mergeLabels, TEST_TIME_SCALING_LABELS } from './playground-labels.js';

export function mount(container, config = {}) {
  const labels = mergeLabels(TEST_TIME_SCALING_LABELS, config.labels);
  const stepCurve = config.stepCurve || [];
  const reasoningCurve = config.reasoningCurve || [];
  const datasetLabel = config.datasetLabel || 'Benchmark subset';
  const hasBoth = stepCurve.length && reasoningCurve.length;

  if (!stepCurve.length && !reasoningCurve.length) {
    container.textContent = 'Test-time scaling requires stepCurve and/or reasoningCurve in lab-data.js';
    return;
  }

  container.className = 'playground playground--scaling';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">${labels.title}</h3>
      <p class="playground__subtitle">${labels.subtitle}</p>
    </div>
    <p class="compare-panel__meta">${datasetLabel}</p>
    <div class="playground__controls">
      ${hasBoth ? `
      <div class="playground__control-group">
        <label class="playground__label">Scaling dimension</label>
        <select class="playground__select" data-scale-mode>
          <option value="steps">${labels.stepsLabel}</option>
          <option value="reasoning">${labels.reasoningLabel}</option>
        </select>
      </div>` : ''}
      <div class="playground__control-group playground__control-group--wide" data-scale-steps-wrap ${stepCurve.length ? '' : 'hidden'}>
        <label class="playground__label">${labels.stepsLabel}: <span class="playground__value" data-scale-steps-val></span></label>
        <input type="range" min="0" max="${Math.max(0, stepCurve.length - 1)}" value="0" data-scale-steps>
        <div class="res-ticks" data-scale-steps-ticks></div>
      </div>
      <div class="playground__control-group" data-scale-reasoning-wrap ${reasoningCurve.length ? '' : 'hidden'}>
        <label class="playground__label">${labels.reasoningLabel}</label>
        <select class="playground__select" data-scale-reasoning></select>
      </div>
    </div>
    <div class="ctx-stats">
      <div class="ctx-stat"><span>LLM-Acc</span> <strong data-scale-acc>—</strong></div>
      <div class="ctx-stat"><span>Setting</span> <strong data-scale-setting>—</strong></div>
    </div>
    <div class="ctx-bar"><div class="ctx-bar__fill" data-scale-bar></div></div>
    <p class="playground__insight" data-scale-insight></p>
  `;

  const modeSel = container.querySelector('[data-scale-mode]');
  const stepsWrap = container.querySelector('[data-scale-steps-wrap]');
  const reasoningWrap = container.querySelector('[data-scale-reasoning-wrap]');
  const stepsSlider = container.querySelector('[data-scale-steps]');
  const stepsVal = container.querySelector('[data-scale-steps-val]');
  const stepsTicks = container.querySelector('[data-scale-steps-ticks]');
  const reasoningSel = container.querySelector('[data-scale-reasoning]');
  const accEl = container.querySelector('[data-scale-acc]');
  const settingEl = container.querySelector('[data-scale-setting]');
  const barEl = container.querySelector('[data-scale-bar]');
  const insightEl = container.querySelector('[data-scale-insight]');

  const maxAcc = Math.max(
    ...stepCurve.map(p => p.accuracy),
    ...reasoningCurve.map(p => p.accuracy),
    1,
  );

  if (stepsTicks && stepCurve.length) {
    stepsTicks.innerHTML = stepCurve.map(p => `<span>${p.steps} steps</span>`).join('');
  }
  if (reasoningSel && reasoningCurve.length) {
    reasoningSel.innerHTML = reasoningCurve.map(p =>
      `<option value="${p.effort}">${p.label || p.effort}</option>`,
    ).join('');
  }

  const state = { mode: stepCurve.length ? 'steps' : 'reasoning' };

  const render = () => {
    markPlaygroundUsed('scaling');
    if (modeSel) state.mode = modeSel.value;
    if (stepsWrap) stepsWrap.hidden = hasBoth && state.mode !== 'steps';
    if (reasoningWrap) reasoningWrap.hidden = hasBoth && state.mode !== 'reasoning';

    let point;
    if (state.mode === 'steps' && stepCurve.length) {
      point = stepCurve[parseInt(stepsSlider.value, 10)];
      if (stepsVal) stepsVal.textContent = point.steps;
      settingEl.textContent = `${point.steps} max steps`;
    } else if (reasoningCurve.length) {
      const effort = reasoningSel?.value || reasoningCurve[0].effort;
      point = reasoningCurve.find(p => p.effort === effort) || reasoningCurve[0];
      settingEl.textContent = point.label || point.effort;
    }

    if (point) {
      accEl.textContent = `${point.accuracy.toFixed(1)}%`;
      barEl.style.width = `${(point.accuracy / maxAcc) * 100}%`;
      insightEl.textContent = point.insight || '';
    }
  };

  modeSel?.addEventListener('change', render);
  stepsSlider?.addEventListener('input', render);
  reasoningSel?.addEventListener('change', render);
  render();
}
