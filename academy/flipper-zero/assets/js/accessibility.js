(() => {
  'use strict';

  const controls = document.querySelector('.accessibility-controls');
  if (!controls) return;

  controls.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;

    console.log('Clicked:', action);

    switch (action) {
      case 'font-up':
        console.log('Increase font');
        break;
      case 'font-down':
        console.log('Decrease font');
        break;
      case 'dyslexia':
        console.log('Toggle dyslexia');
        break;
      case 'contrast':
        console.log('Toggle contrast');
        break;
      case 'motion':
        console.log('Toggle motion');
        break;
    }
  });
})();

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case 'adjustFontSize':
        adjustFontSize(parseInt(value)); 
        break;
      case 'toggleDyslexiaMode':
        toggleDyslexiaMode();
        break;
      case 'toggleHighContrast':
        toggleHighContrast();
        break;
      case 'toggleReducedMotion':
        toggleReducedMotion();
        break;
      case 'toggleMobileMenu':
        toggleMobileMenu();
        break;
      case 'scrollToStory':
        document.querySelector('.story-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  });
});
