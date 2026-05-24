/**
 * Scene Player — scrubbable SVG narrative engine (3Blue1Brown-style v1).
 * Each scene has keyframes; progress 0–1 drives interpolation + narration.
 */

const RENDERERS = {};

export function registerSceneRenderer(id, fn) {
  RENDERERS[id] = fn;
}

/**
 * Mount scene player into container.
 * @param {HTMLElement} container
 * @param {object} config — { scenes: [...], defaultScene?: string }
 */
export function mountScenePlayer(container, config = {}) {
  const scenes = config.scenes || [];
  if (!scenes.length) return null;

  container.className = 'scene-player';
  container.innerHTML = `
    <div class="scene-player__stage" data-scene-svg aria-live="polite"></div>
    <p class="scene-player__narration" data-scene-narration></p>
    <div class="scene-player__controls">
      <button type="button" class="btn btn--secondary scene-player__btn" data-scene-prev aria-label="Previous frame">⏮</button>
      <button type="button" class="btn btn--primary scene-player__btn" data-scene-play aria-label="Play">▶</button>
      <button type="button" class="btn btn--secondary scene-player__btn" data-scene-next aria-label="Next frame">⏭</button>
      <input type="range" class="scene-player__scrub" data-scene-scrub min="0" max="1000" value="0" aria-label="Timeline">
      <select class="scene-player__speed" data-scene-speed aria-label="Playback speed">
        <option value="0.5">0.5×</option>
        <option value="1" selected>1×</option>
        <option value="1.5">1.5×</option>
        <option value="2">2×</option>
      </select>
    </div>
  `;

  const stage = container.querySelector('[data-scene-svg]');
  const narrationEl = container.querySelector('[data-scene-narration]');
  const scrub = container.querySelector('[data-scene-scrub]');
  const playBtn = container.querySelector('[data-scene-play]');

  const state = {
    sceneIndex: scenes.findIndex(s => s.id === config.defaultScene) || 0,
    progress: 0,
    playing: false,
    speed: 1,
    raf: null,
    lastTs: null,
  };

  const currentScene = () => scenes[state.sceneIndex];

  const sceneDuration = () => currentScene()?.duration || 8000;

  const render = () => {
    const scene = currentScene();
    if (!scene) return;
    const renderer = RENDERERS[scene.id] || RENDERERS.default;
    if (renderer) {
      stage.innerHTML = renderer(scene, state.progress);
    }
    const cues = scene.narration || [];
    const idx = Math.min(
      cues.length - 1,
      Math.floor(state.progress * cues.length)
    );
    narrationEl.textContent = cues[idx] || '';
    scrub.value = Math.round(state.progress * 1000);
    container.dispatchEvent(new CustomEvent('scene:update', {
      detail: { sceneId: scene.id, progress: state.progress },
    }));
  };

  const setProgress = (p) => {
    state.progress = Math.max(0, Math.min(1, p));
    render();
  };

  const tick = (ts) => {
    if (!state.playing) return;
    if (state.lastTs == null) state.lastTs = ts;
    const dt = (ts - state.lastTs) * state.speed;
    state.lastTs = ts;
    const next = state.progress + dt / sceneDuration();
    if (next >= 1) {
      setProgress(1);
      stop();
    } else {
      setProgress(next);
      state.raf = requestAnimationFrame(tick);
    }
  };

  const play = () => {
    if (state.progress >= 1) setProgress(0);
    state.playing = true;
    state.lastTs = null;
    playBtn.textContent = '⏸';
    playBtn.setAttribute('aria-label', 'Pause');
    state.raf = requestAnimationFrame(tick);
  };

  const stop = () => {
    state.playing = false;
    state.lastTs = null;
    playBtn.textContent = '▶';
    playBtn.setAttribute('aria-label', 'Play');
    if (state.raf) cancelAnimationFrame(state.raf);
  };

  playBtn.addEventListener('click', () => (state.playing ? stop() : play()));
  container.querySelector('[data-scene-prev]').addEventListener('click', () => {
    stop();
    setProgress(state.progress - 0.05);
  });
  container.querySelector('[data-scene-next]').addEventListener('click', () => {
    stop();
    setProgress(state.progress + 0.05);
  });
  scrub.addEventListener('input', () => {
    stop();
    setProgress(parseInt(scrub.value, 10) / 1000);
  });
  container.querySelector('[data-scene-speed]').addEventListener('change', (e) => {
    state.speed = parseFloat(e.target.value);
  });

  render();

  return {
    seekScene(sceneId, progress = 0) {
      const idx = scenes.findIndex(s => s.id === sceneId);
      if (idx >= 0) {
        stop();
        state.sceneIndex = idx;
        setProgress(progress);
      }
    },
    setProgress,
    getState: () => ({ ...state, sceneId: currentScene()?.id }),
    destroy: stop,
  };
}
