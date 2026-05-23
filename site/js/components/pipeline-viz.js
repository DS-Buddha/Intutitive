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
    const config = conceptData[vizType] || {};
    renderViz(container, vizType, config);
  });
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
 * Render a step-by-step stepper (baseline example).
 * Click each step to reveal its failure mode.
 */
function renderStepper(container, config) {
  const { steps = [] } = config;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 600 200');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Step-by-step pipeline');

  const stepWidth = 130;
  steps.forEach((step, i) => {
    const x = 50 + i * stepWidth;
    const y = 80;

    // Circle for step number
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x + 30);
    circle.setAttribute('cy', y + 30);
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', step.color || '#58a6ff');
    circle.setAttribute('opacity', '0.6');
    circle.setAttribute('class', 'stepper-dot');
    circle.setAttribute('data-step', i);

    circle.addEventListener('click', () => {
      highlightStep(svg, i, step);
    });

    svg.appendChild(circle);

    // Step number
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 30);
    text.setAttribute('y', y + 35);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-weight', '700');
    text.setAttribute('font-size', '14');
    text.textContent = i + 1;
    svg.appendChild(text);

    // Step label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + 30);
    label.setAttribute('y', y + 65);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '11');
    label.setAttribute('fill', '#8b949e');
    label.textContent = step.label || `Step ${i + 1}`;
    svg.appendChild(label);

    // Arrow to next step
    if (i < steps.length - 1) {
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      arrow.setAttribute('x1', x + 55);
      arrow.setAttribute('y1', y + 30);
      arrow.setAttribute('x2', x + 75);
      arrow.setAttribute('y2', y + 30);
      arrow.setAttribute('stroke', '#484f58');
      arrow.setAttribute('stroke-width', '2');
      arrow.setAttribute('marker-end', 'url(#arrow-stepper)');
      svg.appendChild(arrow);
    }
  });

  // Arrow marker
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrow-stepper');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('refX', '9');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', '0 0, 10 3, 0 6');
  polygon.setAttribute('fill', '#484f58');
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  container.innerHTML = '';
  container.appendChild(svg);
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

/**
 * Highlight a single step in the stepper and show failure details.
 */
function highlightStep(svg, stepIndex, stepData) {
  const dots = svg.querySelectorAll('.stepper-dot');
  dots.forEach((dot, i) => {
    if (i === stepIndex) {
      dot.setAttribute('opacity', '1');
    } else {
      dot.setAttribute('opacity', '0.3');
    }
  });

  // Optionally show failure details below
  const container = svg.parentElement;
  let details = container.querySelector('[data-step-details]');
  if (!details) {
    details = document.createElement('p');
    details.setAttribute('data-step-details', 'true');
    details.style.marginTop = 'var(--space-4)';
    details.style.textAlign = 'center';
    container.appendChild(details);
  }
  details.textContent = stepData.failureDescription || `Step ${stepIndex + 1}: ${stepData.label}`;
}
