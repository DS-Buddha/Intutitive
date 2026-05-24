/**
 * Pipeline Visualization Component
 * Renders animated SVG diagrams of multi-stage pipelines.
 * Modes: overview, walkthrough, comparison
 */

/**
 * Initialize all visualization containers on the page.
 */
export function mountAll(conceptData) {
  const containers = document.querySelectorAll('[data-viz-type]');
  containers.forEach(container => {
    const vizType = container.getAttribute('data-viz-type');
    const config = resolveVizConfig(conceptData, vizType);
    renderViz(container, vizType, config);
  });
}

/**
 * Resolve viz config from concept data (supports nested and flat shapes).
 */
function resolveVizConfig(conceptData, vizType) {
  if (conceptData[vizType]) return conceptData[vizType];
  if (vizType === 'baseline-pipeline-stepper' && conceptData.steps) {
    return { steps: conceptData.steps };
  }
  if (vizType === 'failure-chain' && conceptData.failureChain) {
    return { steps: conceptData.failureChain };
  }
  return {};
}

/**
 * Render a single visualization based on type.
 */
function renderViz(container, vizType, config) {
  switch (vizType) {
    case 'rag-pipeline-map':
      renderPipelineMap(container, config);
      break;
    case 'baseline-pipeline-stepper':
      renderStepper(container, config);
      break;
    case 'pipeline-comparison':
      renderComparison(container, config);
      break;
    case 'failure-chain':
      renderFailureChain(container, config);
      break;
    default:
      console.warn(`Unknown viz type: ${vizType}`);
  }
}

/**
 * Render the main 6-stage RAG pipeline map.
 * All stages visible, clickable, with optional walkthrough mode.
 */
function renderPipelineMap(container, config) {
  const { stages = [], edges = [], walkthrough = [] } = config;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1000 300');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'RAG pipeline overview');

  // Draw stages as boxes
  const stageElements = [];
  stages.forEach((stage, i) => {
    const x = 100 + i * 130;
    const y = 100;

    // Box
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', '120');
    rect.setAttribute('height', '80');
    rect.setAttribute('rx', '8');
    rect.setAttribute('fill', stage.color || '#58a6ff');
    rect.setAttribute('opacity', '0.8');
    rect.setAttribute('class', 'stage-box');
    rect.setAttribute('data-stage', stage.id);

    rect.addEventListener('click', () => {
      if (stage.link) {
        window.location.href = stage.link;
      }
    });

    rect.addEventListener('mouseover', () => {
      rect.setAttribute('opacity', '1');
      showStageLabel(svg, x + 60, y - 20, stage.label);
    });

    rect.addEventListener('mouseout', () => {
      rect.setAttribute('opacity', '0.8');
      hideStageLabel(svg);
    });

    svg.appendChild(rect);

    // Text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 60);
    text.setAttribute('y', y + 45);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-weight', '600');
    text.setAttribute('font-size', '12');
    text.textContent = stage.id.replace('-', ' ');
    svg.appendChild(text);

    stageElements.push({ rect, text, stage });
  });

  // Draw edges between stages
  edges.forEach(edge => {
    const fromIdx = stages.findIndex(s => s.id === edge.from);
    const toIdx = stages.findIndex(s => s.id === edge.to);

    if (fromIdx !== -1 && toIdx !== -1) {
      const x1 = 100 + fromIdx * 130 + 120;
      const x2 = 100 + toIdx * 130;
      const y = 140;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#8b949e');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end', 'url(#arrowhead)');
      svg.appendChild(line);
    }
  });

  // Arrow marker
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrowhead');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('refX', '9');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', '0 0, 10 3, 0 6');
  polygon.setAttribute('fill', '#8b949e');
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  container.innerHTML = '';
  container.appendChild(svg);

  // Add walkthrough controls if walkthrough data exists
  if (walkthrough.length > 0) {
    addWalkthroughControls(container, walkthrough);
  }
}

/**
 * Render a rich HTML step-by-step stepper with play walkthrough.
 */
function renderStepper(container, config) {
  const { steps = [] } = config;
  if (steps.length === 0) {
    container.innerHTML = '<p class="text-secondary text-center">Interactive demo loading…</p>';
    return;
  }

  container.classList.add('viz-container--interactive');
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'pipeline-stepper';

  const stepsRow = document.createElement('div');
  stepsRow.className = 'stepper-steps';
  stepsRow.setAttribute('role', 'tablist');

  steps.forEach((step, i) => {
    const btn = document.createElement('button');
    btn.className = 'stepper-step';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('data-step', i);
    if (i === 0) btn.setAttribute('data-active', 'true');

    btn.innerHTML = `
      <span class="stepper-step__circle" style="background-color:${step.color || 'var(--color-accent-primary)'}">${i + 1}</span>
      <span class="stepper-step__label">${step.label || `Step ${i + 1}`}</span>
    `;

    btn.addEventListener('click', () => showStep(wrapper, steps, i));
    stepsRow.appendChild(btn);
  });

  const detail = document.createElement('div');
  detail.className = 'stepper-detail';
  detail.setAttribute('data-step-detail', 'true');

  const controls = document.createElement('div');
  controls.className = 'stepper-controls';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn-secondary';
  prevBtn.textContent = '← Previous';
  prevBtn.addEventListener('click', () => {
    const current = getActiveStepIndex(wrapper);
    if (current > 0) showStep(wrapper, steps, current - 1);
  });

  const playBtn = document.createElement('button');
  playBtn.className = 'btn-primary';
  playBtn.textContent = '▶ Play walkthrough';
  playBtn.addEventListener('click', () => runStepperWalkthrough(wrapper, steps, playBtn));

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn-secondary';
  nextBtn.textContent = 'Next →';
  nextBtn.addEventListener('click', () => {
    const current = getActiveStepIndex(wrapper);
    if (current < steps.length - 1) showStep(wrapper, steps, current + 1);
  });

  controls.appendChild(prevBtn);
  controls.appendChild(playBtn);
  controls.appendChild(nextBtn);

  wrapper.appendChild(stepsRow);
  wrapper.appendChild(detail);
  wrapper.appendChild(controls);
  container.appendChild(wrapper);

  showStep(wrapper, steps, 0);
}

function getActiveStepIndex(wrapper) {
  const active = wrapper.querySelector('.stepper-step[data-active="true"]');
  return active ? parseInt(active.getAttribute('data-step'), 10) : 0;
}

function showStep(wrapper, steps, index) {
  const step = steps[index];
  if (!step) return;

  wrapper.querySelectorAll('.stepper-step').forEach((btn, i) => {
    btn.toggleAttribute('data-active', i === index);
  });

  const detail = wrapper.querySelector('[data-step-detail]');
  if (detail) {
    detail.innerHTML = `
      <div class="stepper-detail__header">
        <span class="stepper-detail__badge" style="background-color:${step.color || 'var(--color-accent-primary)'}">${index + 1}</span>
        <h3 class="stepper-detail__title">${step.label || `Step ${index + 1}`}</h3>
      </div>
      <p class="stepper-detail__desc">${step.description || ''}</p>
      <div class="stepper-detail__failure">
        <p class="stepper-detail__failure-label">What breaks without this step</p>
        <p>${step.failureDescription || 'This step is critical to the pipeline.'}</p>
      </div>
    `;
  }
}

function runStepperWalkthrough(wrapper, steps, playBtn) {
  let idx = 0;
  let timer = null;

  const stop = () => {
    if (timer) clearTimeout(timer);
    playBtn.textContent = '▶ Play walkthrough';
    playBtn.onclick = () => runStepperWalkthrough(wrapper, steps, playBtn);
  };

  playBtn.textContent = '⏸ Pause';
  playBtn.onclick = stop;

  const advance = () => {
    showStep(wrapper, steps, idx);
    idx++;
    if (idx < steps.length) {
      timer = setTimeout(advance, 2500);
    } else {
      stop();
    }
  };

  idx = 0;
  advance();
}

/**
 * Render a before/after comparison diagram.
 */
function renderComparison(container, config) {
  const { before = {}, after = {} } = config;

  const div = document.createElement('div');
  div.style.display = 'grid';
  div.style.gridTemplateColumns = '1fr 1fr';
  div.style.gap = 'var(--space-4)';

  // Before
  const beforeDiv = document.createElement('div');
  beforeDiv.innerHTML = `
    <h4>Without ${before.title || 'this'}</h4>
    <p>${before.description || 'Original approach'}</p>
  `;
  div.appendChild(beforeDiv);

  // After
  const afterDiv = document.createElement('div');
  afterDiv.innerHTML = `
    <h4>With ${after.title || 'this'}</h4>
    <p>${after.description || 'Improved approach'}</p>
  `;
  div.appendChild(afterDiv);

  container.innerHTML = '';
  container.appendChild(div);
}

/**
 * Render an animated failure chain.
 */
function renderFailureChain(container, config) {
  const { steps = [] } = config;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 800 150');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Failure chain animation');

  const boxWidth = 140;
  const boxHeight = 60;
  const boxGap = 20;

  steps.forEach((step, i) => {
    const x = 30 + i * (boxWidth + boxGap);
    const y = 40;

    // Box
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', boxWidth);
    rect.setAttribute('height', boxHeight);
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', '#f85149');
    rect.setAttribute('opacity', '0.3');
    rect.setAttribute('class', 'failure-box');
    svg.appendChild(rect);

    // Text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + boxWidth / 2);
    text.setAttribute('y', y + boxHeight / 2 + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', '600');
    text.setAttribute('fill', '#f85149');
    text.textContent = step.label || `Failure ${i + 1}`;
    svg.appendChild(text);

    // Arrow to next
    if (i < steps.length - 1) {
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      arrow.setAttribute('x1', x + boxWidth);
      arrow.setAttribute('y1', y + boxHeight / 2);
      arrow.setAttribute('x2', x + boxWidth + boxGap);
      arrow.setAttribute('y2', y + boxHeight / 2);
      arrow.setAttribute('stroke', '#f85149');
      arrow.setAttribute('stroke-width', '2');
      arrow.setAttribute('marker-end', 'url(#arrow-failure)');
      svg.appendChild(arrow);
    }
  });

  // Arrow marker
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrow-failure');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('refX', '9');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', '0 0, 10 3, 0 6');
  polygon.setAttribute('fill', '#f85149');
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  container.innerHTML = '';
  container.appendChild(svg);
}

/**
 * Show a tooltip label for a stage.
 */
function showStageLabel(svg, x, y, label) {
  let tooltip = svg.querySelector('[data-tooltip]');
  if (!tooltip) {
    tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tooltip.setAttribute('data-tooltip', 'true');
    tooltip.setAttribute('fill', 'white');
    tooltip.setAttribute('font-size', '12');
    tooltip.setAttribute('font-weight', '600');
    tooltip.setAttribute('text-anchor', 'middle');
    svg.appendChild(tooltip);
  }
  tooltip.setAttribute('x', x);
  tooltip.setAttribute('y', y);
  tooltip.textContent = label;
  tooltip.style.opacity = '1';
}

/**
 * Hide the stage label tooltip.
 */
function hideStageLabel(svg) {
  const tooltip = svg.querySelector('[data-tooltip]');
  if (tooltip) {
    tooltip.style.opacity = '0';
  }
}

/**
 * Add walkthrough controls (Play, Pause, Next, Prev).
 */
function addWalkthroughControls(container, walkthroughSteps) {
  const controls = document.createElement('div');
  controls.style.marginTop = 'var(--space-4)';
  controls.style.display = 'flex';
  controls.style.gap = 'var(--space-2)';
  controls.style.justifyContent = 'center';

  const playBtn = document.createElement('button');
  playBtn.textContent = 'Play walkthrough';
  playBtn.className = 'btn-primary';

  playBtn.addEventListener('click', () => {
    runWalkthrough(container, walkthroughSteps);
  });

  controls.appendChild(playBtn);
  container.appendChild(controls);
}

/**
 * Run the walkthrough animation sequence.
 */
function runWalkthrough(container, steps) {
  let currentStep = 0;

  const showStep = () => {
    if (currentStep >= steps.length) return;

    const step = steps[currentStep];
    // Highlight the active stage
    const stage = container.querySelector(`[data-stage="${step.activeStage}"]`);
    if (stage) {
      stage.setAttribute('opacity', '1');
    }

    // Show narration
    let narration = container.querySelector('[data-narration]');
    if (!narration) {
      narration = document.createElement('p');
      narration.setAttribute('data-narration', 'true');
      narration.style.textAlign = 'center';
      narration.style.fontStyle = 'italic';
      narration.style.color = 'var(--color-text-secondary)';
      container.appendChild(narration);
    }
    narration.textContent = step.narration || '';

    currentStep++;
    if (currentStep < steps.length) {
      setTimeout(showStep, step.durationMs || 2000);
    }
  };

  showStep();
}
