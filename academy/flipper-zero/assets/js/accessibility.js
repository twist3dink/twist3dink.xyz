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
