// academy/flipper-zero/assets/js/overview.js
import { loadProgress, isUnlocked, isCompleted } from './progress.js';
import { COURSE } from './course-config.js';

const qs = (s) => document.querySelector(s);

function showToast(message) {
  const toast = qs('#lock-toast');
  const msg = qs('#lock-msg');
  msg.textContent = message;
  toast.style.display = 'block';
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

function render(progress) {
  qs('#completed-count').textContent = String(progress.completedLessons.length);
  qs('#xp-count').textContent = String(progress.totalXP);

  qs('#total-lessons').textContent = String(COURSE.totalLessons);
  qs('#total-duration').textContent = COURSE.totalDurationText;

  const pct = Math.round((progress.completedLessons.length / COURSE.totalLessons) * 100);
  qs('#progress-bar').style.width = pct + '%';
  qs('#progress-text').textContent = pct + '% Complete';

  const grid = qs('#lessons-grid');
  grid.innerHTML = '';

  for (const lesson of COURSE.lessons) {
    const completed = isCompleted(progress, lesson.n);
    const unlocked = isUnlocked(progress, lesson.n);

    const card = document.createElement('div');
    card.className = 'lesson-card ' + (completed ? 'completed' : (unlocked ? 'unlocked' : 'locked'));
    card.dataset.lesson = String(lesson.n);

    const status = completed ? '✓ Complete' : (unlocked ? 'Start' : 'Locked');
    const badgeClass = completed ? 'completed' : (unlocked ? 'unlocked' : 'locked');

    card.innerHTML = `
      <div class="lesson-header-row">
        <span class="lesson-number">LESSON ${lesson.n}</span>
        <div class="lesson-status">
          <span class="status-badge ${badgeClass}">${status}</span>
        </div>
      </div>
      <h3 class="lesson-title">${lesson.title}</h3>
      <p class="lesson-description">${lesson.description}</p>
      <div class="lesson-meta-row">
        <span>⏱️ ${lesson.minutes} minutes</span>
        <span>⭐ ${lesson.xp} XP</span>
        <span>📝 ${lesson.level}</span>
      </div>
      <a class="start-button" href="${lesson.path}">Start Lesson →</a>
    `;
    grid.appendChild(card);
  }
}

function handleClick(e) {
  const card = e.target.closest('.lesson-card');
  if (!card) return;

  if (card.classList.contains('locked')) {
    e.preventDefault();
    const n = card.dataset.lesson;
    showToast(`Lesson ${n} is locked. Complete the previous lesson to unlock it.`);
    return;
  }

  const link = card.querySelector('a.start-button');
  if (link && e.target !== link) window.location.href = link.getAttribute('href');
}

function init() {
  const progress = loadProgress();
  render(progress);
  qs('#lessons-grid')?.addEventListener('click', handleClick);
  qs('#lock-close')?.addEventListener('click', () => { qs('#lock-toast').style.display = 'none'; });
}

window.addEventListener('load', init);
window.addEventListener('focus', init);
