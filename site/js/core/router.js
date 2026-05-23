/**
 * Scroll-spy router. Tracks which section is currently visible
 * and updates sidebar navigation accordingly.
 */

import { emit } from './eventbus.js';

/**
 * Initialize scroll-spy navigation.
 * Marks sections as they scroll into view.
 */
export function initScrollspy() {
  const sections = document.querySelectorAll('[data-section-id]');
  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.getAttribute('data-section-id');

        if (entry.isIntersecting) {
          // Mark section nav as active
          updateActiveSectionNav(sectionId);
          emit('section:enter', { sectionId });
        } else {
          emit('section:leave', { sectionId });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px', // Only middle 5% of viewport counts as "visible"
    }
  );

  sections.forEach(section => observer.observe(section));
}

/**
 * Update sidebar section nav to mark the active section.
 */
function updateActiveSectionNav(activeSectionId) {
  const navLinks = document.querySelectorAll('[data-section]');
  navLinks.forEach(link => {
    const sectionId = link.getAttribute('data-section');
    if (sectionId === activeSectionId) {
      link.setAttribute('data-active', 'true');
      link.classList.add('active');
    } else {
      link.removeAttribute('data-active');
      link.classList.remove('active');
    }
  });
}

/**
 * Smooth scroll to a section.
 */
export function scrollToSection(sectionId) {
  const section = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}
