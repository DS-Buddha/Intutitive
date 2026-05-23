/**
 * Progress Ring Component
 * SVG circle with animated stroke-dasharray to show completion percentage.
 */

import { getTopicCompletion } from '../core/progress.js';

/**
 * Mount all progress rings on the page.
 */
export function mountAll(topicData) {
  const rings = document.querySelectorAll('[data-progress-ring]');
  rings.forEach(ring => {
    const topicId = ring.getAttribute('data-progress-ring');
    const conceptCount = topicData && topicData[topicId]
      ? topicData[topicId].conceptCount || 1
      : 1;
    renderProgressRing(ring, topicId, conceptCount);
  });
}

/**
 * Render a single progress ring.
 */
function renderProgressRing(container, topicId, conceptCount) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100');
  svg.setAttribute('height', '100');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Progress: topic ${topicId}`);

  // Background circle
  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bgCircle.setAttribute('cx', '50');
  bgCircle.setAttribute('cy', '50');
  bgCircle.setAttribute('r', '45');
  bgCircle.setAttribute('fill', 'none');
  bgCircle.setAttribute('stroke', 'var(--color-border)');
  bgCircle.setAttribute('stroke-width', '4');
  svg.appendChild(bgCircle);

  // Progress circle
  const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  progressCircle.setAttribute('cx', '50');
  progressCircle.setAttribute('cy', '50');
  progressCircle.setAttribute('r', '45');
  progressCircle.setAttribute('fill', 'none');
  progressCircle.setAttribute('stroke', 'var(--color-accent-primary)');
  progressCircle.setAttribute('stroke-width', '4');
  progressCircle.setAttribute('stroke-linecap', 'round');
  progressCircle.setAttribute('stroke-dasharray', '282.7 282.7'); // 2 * pi * 45
  progressCircle.setAttribute('data-progress-stroke', 'true');
  progressCircle.style.transition = 'stroke-dashoffset var(--duration-normal) var(--ease-out)';
  progressCircle.style.transform = 'rotate(-90deg)';
  progressCircle.style.transformOrigin = '50px 50px';
  svg.appendChild(progressCircle);

  // Percentage text
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '50');
  text.setAttribute('y', '57');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', 'var(--color-text-secondary)');
  text.setAttribute('font-size', '18');
  text.setAttribute('font-weight', '600');
  text.setAttribute('data-progress-text', 'true');
  text.textContent = '0%';
  svg.appendChild(text);

  container.innerHTML = '';
  container.appendChild(svg);

  // Update with actual progress
  updateProgressRing(container, topicId, conceptCount);
}

/**
 * Update progress ring with current completion %.
 */
export function updateProgressRing(container, topicId, conceptCount) {
  const completion = getTopicCompletion(topicId, conceptCount);
  const circle = container.querySelector('circle[data-progress-stroke]');
  const text = container.querySelector('text[data-progress-text]');

  if (circle) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference * (1 - completion / 100);
    circle.setAttribute('stroke-dashoffset', offset);
  }

  if (text) {
    text.textContent = `${completion}%`;
  }
}
