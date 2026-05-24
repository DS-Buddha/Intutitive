/**
 * Learning Chrome — shared UX layer for concept pages.
 * Mobile sidebar, section progress bar, floating prev/next navigation.
 */

import { on } from './eventbus.js';

/**
 * @param {{
 *   sections?: Array<{id: string, label: string, anchor: string}>,
 *   floatingNav?: boolean | 'part-aware',
 *   sectionProgress?: boolean | 'part-scoped',
 *   partGroups?: Array<{id: string, label: string, introAnchor: string, sections: Array}>,
 * }} options
 */
export function initLearningChrome({
  sections = [],
  floatingNav = true,
  sectionProgress = true,
  partGroups = [],
}) {
  if (!sections.length && !partGroups.length) return;

  initMobileSidebar();

  const flatSections = partGroups.length
    ? partGroups.flatMap(p => p.sections)
    : sections;

  let progressBar = null;
  if (sectionProgress === 'part-scoped' && partGroups.length) {
    progressBar = injectPartScopedProgress(partGroups);
  } else if (sectionProgress) {
    progressBar = injectSectionProgress(flatSections);
  }

  if (floatingNav === 'part-aware' && partGroups.length) {
    injectPartAwareFloatingNav(partGroups);
  } else if (floatingNav) {
    injectFloatingNav(flatSections);
  }

  wireSectionTracking(flatSections, progressBar, partGroups);
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
    if (sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
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
    btn.innerHTML = `<span class="section-progress__dot"></span><span>${section.label}</span>`;
    btn.addEventListener('click', () => {
      document.querySelector(section.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    track.appendChild(btn);
  });

  inner.appendChild(label);
  inner.appendChild(track);
  bar.appendChild(inner);
  document.querySelector('.site-header')?.after(bar);
  return bar;
}

function injectPartScopedProgress(partGroups) {
  if (document.querySelector('.section-progress--scoped')) return null;

  const bar = document.createElement('div');
  bar.className = 'section-progress section-progress--scoped';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Journey progress');

  bar.innerHTML = `
    <div class="section-progress__inner section-progress__inner--scoped">
      <span class="section-progress__part-label" data-scoped-part>Part 1 — Understand</span>
      <span class="section-progress__step-label" data-scoped-step>1/6 — Hook</span>
      <div class="section-progress__mini-track" data-scoped-track></div>
    </div>
  `;

  document.querySelector('.site-header')?.after(bar);

  const track = bar.querySelector('[data-scoped-track]');
  partGroups.forEach(part => {
    part.sections.forEach(section => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'section-progress__mini-dot';
      dot.setAttribute('data-section', section.id);
      dot.setAttribute('data-part', part.id);
      dot.setAttribute('aria-label', `${part.label}: ${section.label}`);
      dot.addEventListener('click', () => {
        document.querySelector(section.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      track.appendChild(dot);
    });
  });

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

  const current = document.createElement('span');
  current.className = 'floating-section-nav__current';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn-primary';
  nextBtn.textContent = 'Next →';

  let activeIdx = 0;

  const updateNav = (idx) => {
    activeIdx = idx;
    current.textContent = sections[idx]?.label || '';
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx >= sections.length - 1;
    nextBtn.textContent = idx === sections.length - 1 ? 'Finish ✓' : 'Next →';
  };

  prevBtn.addEventListener('click', () => {
    if (activeIdx > 0) {
      document.querySelector(sections[activeIdx - 1].anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  nextBtn.addEventListener('click', () => {
    if (activeIdx < sections.length - 1) {
      document.querySelector(sections[activeIdx + 1].anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  nav.append(prevBtn, current, nextBtn);
  document.body.appendChild(nav);

  on('section:enter', ({ sectionId }) => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx !== -1) updateNav(idx);
  });

  updateNav(0);
}

function injectPartAwareFloatingNav(partGroups) {
  if (document.querySelector('.floating-section-nav')) return;

  const navItems = [];
  partGroups.forEach((part, pi) => {
    if (pi > 0) {
      navItems.push({
        type: 'boundary',
        label: part.label,
        anchor: part.introAnchor,
        id: part.introAnchor.replace('#', ''),
      });
    }
    part.sections.forEach(s => {
      navItems.push({ type: 'section', ...s, partLabel: part.label });
    });
  });

  const nav = document.createElement('nav');
  nav.className = 'floating-section-nav';
  nav.setAttribute('aria-label', 'Section navigation');

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn-ghost';
  prevBtn.textContent = '← Prev';

  const current = document.createElement('span');
  current.className = 'floating-section-nav__current';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn-primary';
  nextBtn.textContent = 'Next →';

  let activeIdx = 0;

  const scrollTo = (idx) => {
    const item = navItems[idx];
    if (!item) return;
    document.querySelector(item.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateNav = (idx) => {
    activeIdx = idx;
    const item = navItems[idx];
    if (!item) return;
    current.textContent = item.type === 'boundary' ? item.label : item.label;
    prevBtn.disabled = idx === 0;

    const nextItem = navItems[idx + 1];
    if (!nextItem) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Finish ✓';
    } else if (nextItem.type === 'boundary') {
      nextBtn.disabled = false;
      nextBtn.textContent = `${nextItem.label} →`;
    } else {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Next →';
    }
  };

  prevBtn.addEventListener('click', () => {
    if (activeIdx > 0) scrollTo(activeIdx - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (activeIdx < navItems.length - 1) scrollTo(activeIdx + 1);
  });

  nav.append(prevBtn, current, nextBtn);
  document.body.appendChild(nav);

  on('section:enter', ({ sectionId }) => {
    const idx = navItems.findIndex(item => item.id === sectionId);
    if (idx !== -1) updateNav(idx);
  });

  updateNav(0);
}

function wireSectionTracking(sections, progressBar, partGroups = []) {
  on('section:enter', ({ sectionId }) => {
    if (progressBar?.classList.contains('section-progress--scoped') && partGroups.length) {
      updateScopedProgress(progressBar, partGroups, sectionId);
    } else if (progressBar) {
      progressBar.querySelectorAll('.section-progress__step').forEach(step => {
        const id = step.getAttribute('data-section');
        step.toggleAttribute('data-active', id === sectionId);
        if (id === sectionId) step.setAttribute('data-visited', 'true');
      });
    }
  });
}

function updateScopedProgress(bar, partGroups, sectionId) {
  let part = partGroups.find(p => p.sections.some(s => s.id === sectionId));
  if (!part) {
    part = partGroups.find(p => p.introAnchor === `#${sectionId}`);
  }

  if (!part) return;

  const section = part.sections.find(s => s.id === sectionId);
  const sectionIdx = section ? part.sections.indexOf(section) : -1;

  const partEl = bar.querySelector('[data-scoped-part]');
  const stepEl = bar.querySelector('[data-scoped-step]');
  if (partEl) partEl.textContent = part.label;
  if (stepEl) {
    stepEl.textContent = section
      ? `${sectionIdx + 1}/${part.sections.length} — ${section.label}`
      : 'Intro';
  }

  bar.querySelectorAll('.section-progress__mini-dot').forEach(dot => {
    const id = dot.getAttribute('data-section');
    const pid = dot.getAttribute('data-part');
    dot.toggleAttribute('data-active', id === sectionId);
    dot.toggleAttribute('data-visible', pid === part.id);
    if (id === sectionId) dot.setAttribute('data-visited', 'true');
  });
}
