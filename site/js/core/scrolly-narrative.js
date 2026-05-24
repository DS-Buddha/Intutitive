/**
 * Scrolly Narrative — scroll sections drive pinned scene player beats.
 */

/**
 * @param {object} options
 * @param {string} options.stageSelector — pinned scene container
 * @param {string} options.beatSelector — scroll sections with data-scene-beat
 * @param {ReturnType<import('./scene-player.js').mountScenePlayer>} options.player
 */
export function initScrollyNarrative({ stageSelector, beatSelector, player }) {
  const stage = document.querySelector(stageSelector);
  const beats = [...document.querySelectorAll(beatSelector)];
  if (!stage || !beats.length || !player) return;

  const beatMap = new Map();
  beats.forEach(el => {
    const id = el.getAttribute('data-scene-beat');
    const start = parseFloat(el.getAttribute('data-scene-start') || '0');
    if (id) beatMap.set(el, { id, start });
  });

  let pinned = false;

  const onScroll = () => {
    const stageRect = stage.getBoundingClientRect();
    const pinTop = 80;
    pinned = stageRect.top <= pinTop && stageRect.bottom > window.innerHeight * 0.4;

    stage.classList.toggle('scene-stage--pinned', pinned && !window.matchMedia('(max-width: 768px)').matches);

    let active = beats[0];
    beats.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.55) active = el;
    });

    beats.forEach(el => el.classList.toggle('scrolly-beat--active', el === active));

    const beat = beatMap.get(active);
    if (beat) player.seekScene(beat.id, beat.start);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
