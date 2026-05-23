/**
 * Accordion Component
 * Expandable/collapsible details with smooth transitions.
 */

/**
 * Initialize all accordion items on the page.
 */
export function mountAll() {
  const items = document.querySelectorAll('[data-component="accordion"] details');
  items.forEach(item => {
    item.addEventListener('toggle', (e) => {
      if (e.target.open) {
        e.target.classList.add('open');
      } else {
        e.target.classList.remove('open');
      }
    });
  });
}

/**
 * Mount accordion.
 */
export function mountAccordion() {
  mountAll();
}

/**
 * Open a specific accordion item.
 */
export function openAccordion(element) {
  if (element instanceof HTMLElement && element.tagName === 'DETAILS') {
    element.open = true;
    element.classList.add('open');
  }
}

/**
 * Close a specific accordion item.
 */
export function closeAccordion(element) {
  if (element instanceof HTMLElement && element.tagName === 'DETAILS') {
    element.open = false;
    element.classList.remove('open');
  }
}

/**
 * Toggle accordion item.
 */
export function toggleAccordion(element) {
  if (element instanceof HTMLElement && element.tagName === 'DETAILS') {
    element.open = !element.open;
  }
}
