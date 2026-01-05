// academy/flipper-zero/assets/js/lesson.js
import { loadProgress, saveProgress, isUnlocked, isCompleted, markLessonComplete } from './progress.js';

const qs = (s) => document.querySelector(s);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
}

function setCompleteButton(btn, { unlocked, completed, courseFinished }) {
  if (!btn) return;
  btn.classList.remove('locked', 'completed', 'error');
  btn.disabled = false;

  if (completed) {
    btn.textContent = courseFinished ? '✓ Lesson Complete - Course Finished!' : '✓ Lesson Complete';
    btn.classList.add('completed');
    btn.disabled = true;
    return;
  }
  if (!unlocked) {
    btn.textContent = 'Complete Previous Lesson First';
    btn.classList.add('locked');
    btn.disabled = true;
    return;
  }
  btn.textContent = 'Mark Lesson as Complete';
}

function init() {
  const root = qs('[data-lesson-number]');
  if (!root) return;

  const lessonNumber = Number(root.getAttribute('data-lesson-number'));
  const xp = Number(root.getAttribute('data-xp')) || 50;
  const totalLessons = Number(root.getAttribute('data-total-lessons')) || 6;

  const btnComplete = qs('#complete-btn');
  const btnTop = qs('#back-top-btn');
  const btnBottom = qs('#skip-bottom-btn');

  btnTop?.addEventListener('click', scrollToTop);
  btnBottom?.addEventListener('click', scrollToBottom);

  const progress = loadProgress();
  const unlocked = isUnlocked(progress, lessonNumber);
  const completed = isCompleted(progress, lessonNumber);

  setCompleteButton(btnComplete, { unlocked, completed, courseFinished: lessonNumber === totalLessons });

  btnComplete?.addEventListener('click', () => {
    const current = loadProgress();
    const result = markLessonComplete(current, lessonNumber, xp);
    if (!result.ok) return;

    const saved = saveProgress(result.progress);
    if (!saved) {
      btnComplete.textContent = 'Error - Try Again';
      btnComplete.classList.add('error');
      setTimeout(() => setCompleteButton(btnComplete, {
        unlocked: isUnlocked(current, lessonNumber),
        completed: isCompleted(current, lessonNumber),
        courseFinished: lessonNumber === totalLessons
      }), 2000);
      return;
    }
    setCompleteButton(btnComplete, { unlocked: true, completed: true, courseFinished: lessonNumber === totalLessons });
  });
}

window.addEventListener('load', init);
