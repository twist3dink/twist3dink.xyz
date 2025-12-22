# Gold Standard Templates (tw¡st3d_¡nk Academy)

These templates are the canonical standard for the Flipper Zero course.

## Non‑negotiables
- No inline JavaScript (no `<script>...</script>` blocks in lesson/overview HTML)
- No inline event handlers (`onclick=`, `onload=`, etc.)
- No inline CSS (`<style>...</style>`) in lesson/overview HTML
- Shared assets only:
  - `assets/css/course.css`
  - `assets/js/progress.js`
  - `assets/js/lesson.js`
  - `assets/js/course-config.js`
  - `assets/js/overview.js`

## Progress model
localStorage key: `flipper-progress`

Shape:
```json
{ "currentLesson": 1, "completedLessons": [1,2], "totalXP": 100 }
```

## Creating a new lesson
1. Copy `TEMPLATE_LESSON.html` to `lessons/lesson-N/index.html`
2. Fill placeholders and content blocks
3. Update `assets/js/course-config.js` with lesson metadata
