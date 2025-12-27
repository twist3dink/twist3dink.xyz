(() => {
  'use strict';

  const STORAGE_KEY = 'twist3dink_a11y_v1';

  const DEFAULTS = {
    fontScale: 0,          // -3..+3 => 70%..130%
    dyslexia: false,
    highContrast: false,
    reducedMotion: false,
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const obj = JSON.parse(raw);
      return { ...DEFAULTS, ...obj };
    } catch {
      return { ...DEFAULTS };
    }
  };

  const save = (state) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  };

  const apply = (state) => {
    const root = document.documentElement;

    // fontScale: -3..+3 => 70..130 (10% steps)
    state.fontScale = clamp(state.fontScale, -3, 3);
    const pct = 100 + (state.fontScale * 10);
    root.style.setProperty('--a11y-font-scale', `${pct}%`);

    root.toggleAttribute('data-dyslexia', !!state.dyslexia);
    root.toggleAttribute('data-high-contrast', !!state.highContrast);
    root.toggleAttribute('data-reduced-motion', !!state.reducedMotion);
  };

  const updateAriaPressed = (state) => {
    const map = {
      dyslexia: state.dyslexia,
      contrast: state.highContrast,
      motion: state.reducedMotion,
    };

    document.querySelectorAll('.accessibility-controls button[data-action]').forEach((btn) => {
      const action = btn.dataset.action;
      if (action in map) btn.setAttribute('aria-pressed', String(!!map[action]));
    });
  };

  const init = () => {
    const controls = document.querySelector('.accessibility-controls');
    if (!controls) return;

    let state = load();
    apply(state);
    updateAriaPressed(state);

    controls.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;

      switch (button.dataset.action) {
        case 'font-up':
          state.fontScale += 1;
          break;
        case 'font-down':
          state.fontScale -= 1;
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

      apply(state);
      updateAriaPressed(state);
      save(state);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
