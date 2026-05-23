/**
 * Tab Panel Component
 * Accessible ARIA tabs with keyboard navigation.
 */

/**
 * Initialize all tab panels on the page.
 */
export function mountAll() {
  const tabLists = document.querySelectorAll('[role="tablist"]');
  tabLists.forEach(tabList => {
    initTabList(tabList);
  });
}

/**
 * Initialize a single tab list.
 */
function initTabList(tabList) {
  const tabs = tabList.querySelectorAll('[role="tab"]');
  const panels = tabList.parentElement.querySelectorAll('[role="tabpanel"]');

  tabs.forEach((tab, idx) => {
    // Click handler
    tab.addEventListener('click', () => {
      selectTab(tabs, panels, idx);
    });

    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      let targetIdx = idx;
      if (e.key === 'ArrowRight') {
        targetIdx = (idx + 1) % tabs.length;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        targetIdx = (idx - 1 + tabs.length) % tabs.length;
        e.preventDefault();
      } else if (e.key === 'Home') {
        targetIdx = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        targetIdx = tabs.length - 1;
        e.preventDefault();
      }
      selectTab(tabs, panels, targetIdx);
      tabs[targetIdx].focus();
    });
  });

  // Set first tab as active by default
  selectTab(tabs, panels, 0);
}

/**
 * Select a tab and show its panel.
 */
function selectTab(tabs, panels, idx) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', i === idx);
    tab.setAttribute('data-active', i === idx);
  });

  panels.forEach((panel, i) => {
    if (i === idx) {
      panel.removeAttribute('hidden');
      panel.style.display = 'block';
    } else {
      panel.setAttribute('hidden', 'true');
      panel.style.display = 'none';
    }
  });
}

/**
 * Mount tab panels.
 */
export function mountTabs() {
  mountAll();
}
