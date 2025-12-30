// home.js - attach event listeners for navigation and scroll actions

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-action="toggleMobileMenu"]');
  const navMenu = document.querySelector('header nav ul');

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
    // Close menu when clicking outside on mobile
    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !menuButton.contains(event.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // Smooth scroll to the story section
  const scrollLink = document.querySelector('[data-action="scrollToStory"]');
  const storySection = document.getElementById('story');
  if (scrollLink && storySection) {
    scrollLink.addEventListener('click', (event) => {
      event.preventDefault();
      storySection.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
