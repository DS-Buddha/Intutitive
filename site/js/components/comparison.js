/**
 * Comparison Component
 * Before/after slider with draggable divider.
 */

/**
 * Mount all comparison sliders on the page.
 */
export function mountAll() {
  const sliders = document.querySelectorAll('[data-component="comparison"]');
  sliders.forEach(slider => {
    initComparisonSlider(slider);
  });
}

/**
 * Initialize a single comparison slider.
 */
function initComparisonSlider(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'comparison-wrapper';
  wrapper.style.position = 'relative';
  wrapper.style.width = '100%';
  wrapper.style.maxWidth = '600px';
  wrapper.style.margin = '0 auto';
  wrapper.style.overflow = 'hidden';
  wrapper.style.borderRadius = 'var(--radius-lg)';
  wrapper.style.border = '1px solid var(--color-border)';

  // Before panel
  const before = document.createElement('div');
  before.className = 'comparison-before';
  before.style.position = 'absolute';
  before.style.left = '0';
  before.style.top = '0';
  before.style.width = '100%';
  before.style.height = '100%';
  before.style.backgroundColor = 'var(--color-bg-elevated)';
  before.style.padding = 'var(--space-4)';
  before.style.overflow = 'hidden';
  before.innerHTML = '<h4>Before</h4><p>Original approach, without optimization</p>';

  // After panel
  const after = document.createElement('div');
  after.className = 'comparison-after';
  after.style.position = 'absolute';
  after.style.left = '0';
  after.style.top = '0';
  after.style.width = '100%';
  after.style.height = '100%';
  after.style.backgroundColor = 'var(--color-bg-surface)';
  after.style.padding = 'var(--space-4)';
  after.style.overflow = 'hidden';
  after.style.clipPath = 'inset(0 50% 0 0)';
  after.innerHTML = '<h4>After</h4><p>Optimized approach with this technique</p>';

  // Divider
  const divider = document.createElement('div');
  divider.className = 'comparison-divider';
  divider.style.position = 'absolute';
  divider.style.left = '50%';
  divider.style.top = '0';
  divider.style.width = '2px';
  divider.style.height = '100%';
  divider.style.backgroundColor = 'var(--color-accent-primary)';
  divider.style.cursor = 'col-resize';
  divider.style.zIndex = '10';

  // Handle
  const handle = document.createElement('div');
  handle.style.position = 'absolute';
  handle.style.left = 'calc(50% - 16px)';
  handle.style.top = '50%';
  handle.style.transform = 'translateY(-50%)';
  handle.style.width = '32px';
  handle.style.height = '32px';
  handle.style.backgroundColor = 'var(--color-accent-primary)';
  handle.style.borderRadius = '50%';
  handle.style.display = 'flex';
  handle.style.alignItems = 'center';
  handle.style.justifyContent = 'center';
  handle.style.cursor = 'pointer';
  handle.style.zIndex = '20';
  handle.style.userSelect = 'none';
  handle.innerHTML = '◀ ▶';
  handle.style.fontSize = '10px';
  handle.style.color = 'white';

  divider.appendChild(handle);
  wrapper.appendChild(before);
  wrapper.appendChild(after);
  wrapper.appendChild(divider);

  // Set height based on content
  wrapper.style.minHeight = '300px';

  container.innerHTML = '';
  container.appendChild(wrapper);

  // Drag handler
  let isDragging = false;

  const startDrag = () => {
    isDragging = true;
  };

  const stopDrag = () => {
    isDragging = false;
  };

  const drag = (e) => {
    if (!isDragging) return;

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    if (percentage >= 0 && percentage <= 100) {
      updateSlider(wrapper, percentage);
    }
  };

  // Mouse events
  handle.addEventListener('mousedown', startDrag);
  divider.addEventListener('mousedown', startDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('mousemove', drag);

  // Touch events
  handle.addEventListener('touchstart', startDrag);
  divider.addEventListener('touchstart', startDrag);
  document.addEventListener('touchend', stopDrag);
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const rect = wrapper.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    if (percentage >= 0 && percentage <= 100) {
      updateSlider(wrapper, percentage);
    }
  });
}

/**
 * Update slider position.
 */
function updateSlider(wrapper, percentage) {
  const divider = wrapper.querySelector('.comparison-divider');
  const after = wrapper.querySelector('.comparison-after');
  const handle = wrapper.querySelector('[style*="col-resize"]').parentElement.querySelector('div:last-child') || wrapper.querySelector('.comparison-divider div');

  divider.style.left = `${percentage}%`;
  handle.style.left = `calc(${percentage}% - 16px)`;
  after.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
}

/**
 * Mount comparison component.
 */
export function mountComparison() {
  mountAll();
}
