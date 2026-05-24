/**
 * Learning Chrome — shared UX layer for concept pages.
 * Mobile sidebar, section progress bar, floating prev/next navigation.
 */

import { on } from './eventbus.js';

/**
 * Initialize all learning chrome features for a concept page.
 * @param {{ sections: Array<{id: string, label: string, anchor: string}> }} options
 */
export function initLearningChrome({ sections }) {
  if (!sections || sections.length === 0) return;

  initMobileSidebar();
  const progressBar = injectSectionProgress(sections);
  injectFloatingNav(sections);
  wireSectionTracking(sections, progressBar);
}

function initMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const header = document.querySelector('.site-header');
  if (!sidebar || !header) return;

  let toggle = header.querySelector('.mobile-nav-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'mobile-nav-toggle';
    toggle.setAttribute('aria-label', 'Open page navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    header.insertBefore(toggle, header.querySelector('.header-actions'));
  }

  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  };

  const openSidebar = () => {
    sidebar.classList.add('open');
    backdrop.classList.add('visible');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = '✕';
  };

  toggle.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  backdrop.addEventListener('click', closeSidebar);

  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
}

function injectSectionProgress(sections) {
  if (document.querySelector('.section-progress')) return null;

  const bar = document.createElement('div');
  bar.className = 'section-progress';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Page sections');

  const inner = document.createElement('div');
  inner.className = 'section-progress__inner';

  const label = document.createElement('span');
  label.className = 'section-progress__label';
  label.textContent = 'Progress';

  const track = document.createElement('div');
  track.className = 'section-progress__track';

  sections.forEach((section, idx) => {
    const btn = document.createElement('button');
    btn.className = 'section-progress__step';
    btn.setAttribute('data-section', section.id);
    btn.setAttribute('aria-label', section.label);
    if (idx === 0) btn.setAttribute('data-active', 'true');

    btn.innerHTML = `
      <span class="section-progress__dot"></span>
      <span>${section.label}</span>
    `;

    btn.addEventListener('click', () => {
      const target = document.querySelector(section.anchor);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    track.appendChild(btn);
  });

  inner.appendChild(label);
  inner.appendChild(track);
  bar.appendChild(inner);

  const header = document.querySelector('.site-header');
  if (header) {
    header.after(bar);
  }

  return bar;
}

function injectFloatingNav(sections) {
  if (document.querySelector('.floating-section-nav')) return;

  const nav = document.createElement('nav');
  nav.className = 'floating-section-nav';
  nav.setAttribute('aria-label', 'Section navigation');

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn-ghost';
  prevBtn.textContent = '← Prev';
  prevBtn.setAttribute('aria-label', 'Previous section');

  const current = document.createElement('span');
  current.className = 'floating-section-nav__current';
  current.textContent = sections[0].label;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn-primary';
  nextBtn.textContent = 'Next →';
  nextBtn.setAttribute('aria-label', 'Next section');

  let activeIdx = 0;

  const updateNav = (idx) => {
    activeIdx = idx;
    current.textContent = sections[idx].label;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === sections.length - 1;
    nextBtn.textContent = idx === sections.length - 1 ? 'Finish ✓' : 'Next →';
  };

  prevBtn.addEventListener('click', () => {
    if (activeIdx > 0) {
      const target = document.querySelector(sections[activeIdx - 1].anchor);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  nextBtn.addEventListener('click', () => {
    if (activeIdx < sections.length - 1) {
      const target = document.querySelector(sections[activeIdx + 1].anchor);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  nav.appendChild(prevBtn);
  nav.appendChild(current);
  nav.appendChild(nextBtn);
  document.body.appendChild(nav);

  on('section:enter', ({ sectionId }) => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx !== -1) updateNav(idx);
  });

  updateNav(0);
}

function wireSectionTracking(sections, progressBar) {
  if (!progressBar) return;

  on('section:enter', ({ sectionId }) => {
    progressBar.querySelectorAll('.section-progress__step').forEach(step => {
      const id = step.getAttribute('data-section');
      step.toggleAttribute('data-active', id === sectionId);
      if (id === sectionId) {
        step.setAttribute('data-visited', 'true');
      }
    });
  });
}
