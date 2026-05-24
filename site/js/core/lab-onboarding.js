/**
 * First-visit onboarding card for the paper lab.
 */

import { isFlag, setFlag, KEYS } from './lab-progress.js';

export function initLabOnboarding() {
  if (isFlag(KEYS.onboardingDismissed)) return;

  const hook = document.getElementById('understand-hook');
  if (!hook) return;

  const card = document.createElement('div');
  card.className = 'lab-onboarding';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', 'How to use this journey');
  card.innerHTML = `
    <div class="lab-onboarding__content">
      <h2 class="lab-onboarding__title">Welcome to the DCI Paper Journey</h2>
      <ul class="lab-onboarding__list">
        <li><strong>~45–60 min</strong> — read Part 1, try Part 2 labs, then think in Part 3</li>
        <li><strong>Part 1 is read-only</strong> — finish before playgrounds (Part 2 unlocks understanding)</li>
        <li><strong>Paper chat</strong> needs <code>python server/dev_server.py</code> and <code>GEMINI_API_KEY</code> in <code>.env</code></li>
      </ul>
    </div>
    <button type="button" class="btn btn--primary btn--sm lab-onboarding__dismiss">Got it — start Part 1</button>
  `;

  hook.insertBefore(card, hook.firstChild);

  card.querySelector('.lab-onboarding__dismiss').addEventListener('click', () => {
    setFlag(KEYS.onboardingDismissed);
    card.remove();
  });
}
