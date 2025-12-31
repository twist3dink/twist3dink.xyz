/* devil.js - script for writing/devil.js page extracted from original inline js */
// devil.js
(() => { ... })();

        // Accessibility Functions
        let fontSize = 16;
        const minFontSize = 12;
        const maxFontSize = 24;

        function adjustFontSize(change) {
            fontSize += change * 2;
            fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize));
            document.documentElement.style.fontSize = fontSize + 'px';
            localStorage.setItem('fontSize', fontSize);
        }

        function toggleDyslexiaMode() {
            document.body.classList.toggle('dyslexia-friendly');
            const enabled = document.body.classList.contains('dyslexia-friendly');
            localStorage.setItem('dyslexiaMode', enabled);
        }

        function toggleHighContrast() {
            document.body.classList.toggle('high-contrast');
            const enabled = document.body.classList.contains('high-contrast');
            localStorage.setItem('highContrast', enabled);
        }

        function toggleReducedMotion() {
            document.body.classList.toggle('reduce-motion');
            const enabled = document.body.classList.contains('reduce-motion');
            localStorage.setItem('reducedMotion', enabled);
        }

        // Load saved preferences
        window.addEventListener('DOMContentLoaded', () => {
            const savedFontSize = localStorage.getItem('fontSize');
            if (savedFontSize) {
                fontSize = parseInt(savedFontSize);
                document.documentElement.style.fontSize = fontSize + 'px';
            }

            if (localStorage.getItem('dyslexiaMode') === 'true') {
                document.body.classList.add('dyslexia-friendly');
            }

            if (localStorage.getItem('highContrast') === 'true') {
                document.body.classList.add('high-contrast');
            }

            if (localStorage.getItem('reducedMotion') === 'true') {
                document.body.classList.add('reduce-motion');
            }
        });
