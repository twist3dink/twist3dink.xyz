// academy/flipper-zero/assets/js/progress.js
export const STORAGE_KEY = 'flipper-progress';

export const DEFAULT_PROGRESS = {
  currentLesson: 1,
  completedLessons: [],
  totalXP: 0
};

export function loadProgress(key = STORAGE_KEY) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const p = JSON.parse(raw);
    return {
      currentLesson: Number.isFinite(p.currentLesson) ? p.currentLesson : 1,
      completedLessons: Array.isArray(p.completedLessons) ? p.completedLessons.filter(n => Number.isFinite(n)) : [],
      totalXP: Number.isFinite(p.totalXP) ? p.totalXP : 0
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress, key = STORAGE_KEY) {
  try {
    localStorage.setItem(key, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function isUnlocked(progress, lessonNumber) {
  return lessonNumber === 1 || progress.completedLessons.includes(lessonNumber - 1);
}

export function isCompleted(progress, lessonNumber) {
  return progress.completedLessons.includes(lessonNumber);
}

export function markLessonComplete(progress, lessonNumber, xpAward = 50) {
  if (!isUnlocked(progress, lessonNumber)) return { ok: false, reason: 'locked' };
  if (isCompleted(progress, lessonNumber)) return { ok: true, changed: false, progress };

  const next = { ...progress };
  next.completedLessons = [...new Set([...next.completedLessons, lessonNumber])].sort((a,b)=>a-b);
  next.totalXP = (next.totalXP || 0) + xpAward;
  if (next.currentLesson === lessonNumber) next.currentLesson = lessonNumber + 1;

  return { ok: true, changed: true, progress: next };
}
