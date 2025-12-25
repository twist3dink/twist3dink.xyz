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
  grid.innerHTML = '';  // Safe: Controlled empty string, no user data

  for (const lesson of COURSE.lessons) {
    const completed = isCompleted(progress, lesson.n);
    const unlocked = isUnlocked(progress, lesson.n);

    // Create main card
    const card = document.createElement('div');
    card.className = `lesson-card ${completed ? 'completed' : (unlocked ? 'unlocked' : 'locked')}`;
    card.dataset.lesson = String(lesson.n);

    // Lesson header row
    const headerRow = document.createElement('div');
    headerRow.className = 'lesson-header-row';

    const lessonNumber = document.createElement('span');
    lessonNumber.className = 'lesson-number';
    lessonNumber.textContent = `LESSON ${lesson.n}`;
    headerRow.appendChild(lessonNumber);

    const statusDiv = document.createElement('div');
    statusDiv.className = 'lesson-status';

    const statusBadge = document.createElement('span');
    const badgeClass = completed ? 'completed' : (unlocked ? 'unlocked' : 'locked');
    statusBadge.className = `status-badge ${badgeClass}`;
    statusBadge.textContent = completed ? '✓ Complete' : (unlocked ? 'Start' : 'Locked');
    statusDiv.appendChild(statusBadge);

    headerRow.appendChild(statusDiv);
    card.appendChild(headerRow);

    // Lesson title
    const title = document.createElement('h3');
    title.className = 'lesson-title';
    title.textContent = lesson.title;
    card.appendChild(title);

    // Lesson description
    const description = document.createElement('p');
    description.className = 'lesson-description';
    description.textContent = lesson.description;
    card.appendChild(description);

    // Lesson meta row
    const metaRow = document.createElement('div');
    metaRow.className = 'lesson-meta-row';

    const timeSpan = document.createElement('span');
    timeSpan.textContent = `⏱️ ${lesson.minutes} minutes`;
    metaRow.appendChild(timeSpan);

    const xpSpan = document.createElement('span');
    xpSpan.textContent = `⭐ ${lesson.xp} XP`;
    metaRow.appendChild(xpSpan);

    const levelSpan = document.createElement('span');
    levelSpan.textContent = `📝 ${lesson.level}`;
    metaRow.appendChild(levelSpan);

    card.appendChild(metaRow);

    // Start button link
    const startLink = document.createElement('a');
    startLink.className = 'start-button';
    startLink.href = lesson.path;
    startLink.textContent = 'Start Lesson →';
    card.appendChild(startLink);

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
