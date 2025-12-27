(() => {
  'use strict';

  // --- Config ---
  const STORAGE_KEY = 'twist3dink_accessibility_v1';

  const DEFAULTS = {
    fontScale: 0,            // -3..+3
    dyslexia: false,
    highContrast: false,
    reducedMotion: false,
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    } catch {
      return { ...DEFAULTS };
    }
  };

  const saveState = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // If storage is blocked, fail silently: accessibility should still work.
    }
  };

  const applyState = (state) => {
    const root = document.documentElement;

    // Font scale: map -3..+3 to % using CSS variable
    // Example: 0 => 100%, +1 => 110%, -1 => 90%
    const pct = 100 + (state.fontScale * 10);
    root.style.setProperty('--a11y-font-scale', `${pct}%`);

    root.toggleAttribute('data-dyslexia', !!state.dyslexia);
    root.toggleAttribute('data-high-contrast', !!state.highContrast);
    root.toggleAttribute('data-reduced-motion', !!state.reducedMotion);
  };

  const updatePressedStates = (state) => {
    // Optional ARIA pressed on toggle buttons for better accessibility
    const map = {
      dyslexia: state.dyslexia,
      contrast: state.highContrast,
      motion: state.reducedMotion,
    };

    document.querySelectorAll('.accessibility-controls [data-action]').forEach((btn) => {
      const action = btn.getAttribute('data-action');
      if (action in map) {
        btn.setAttribute('aria-pressed', String(!!map[action]));
      }
    });
  };

  const init = () => {
    const container = document.querySelector('.accessibility-controls');
    if (!container) return;

    let state = loadState();
    state.fontScale = clamp(state.fontScale, -3, 3);

    applyState(state);
    updatePressedStates(state);

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');

      switch (action) {
        case 'font-down':
          state.fontScale = clamp(state.fontScale - 1, -3, 3);
          break;
        case 'font-up':
          state.fontScale = clamp(state.fontScale + 1, -3, 3);
          break;
        case 'dyslexia':
          state.dyslexia = !state.dyslexia;
          break;
        case 'contrast':
          state.highContrast = !state.highContrast;
          break;
        case 'motion':
          state.reducedMotion = !state.reducedMotion;
          break;
        default:
          return;
      }

      applyState(state);
      updatePressedStates(state);
      saveState(state);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
