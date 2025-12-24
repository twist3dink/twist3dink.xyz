# Contributing to twist3dink.xyz

This repo is opinionated on purpose. We standardize once so the academy can scale without entropy.

## Core rules (non-negotiable)
For the Flipper Zero Academy course pages (`academy/flipper-zero/`):

1. **No inline JavaScript**
   - No `<script> ... </script>` blocks in HTML.
   - Only external module loaders are allowed:
     - `<script type="module" src="..."></script>`

2. **No inline event handlers**
   - No `onclick=`, `onload=`, etc.
   - Use event listeners in shared JS modules.

3. **No inline CSS**
   - No `<style> ... </style>` blocks in HTML.
   - Use shared CSS in `academy/flipper-zero/assets/css/`.

4. **No nonstandard scroll behavior**
   - Do not use `behavior: 'instant'`. Use `auto` or `smooth`.

These rules exist to keep the course **CSP-ready**, consistent, and reviewable.

## Where to edit what
- **Lesson content (text/sections):**
  - `academy/flipper-zero/lessons/lesson-N/index.html`
- **Shared styling:**
  - `academy/flipper-zero/assets/css/course.css`
- **Progress + gating logic:**
  - `academy/flipper-zero/assets/js/progress.js`
  - `academy/flipper-zero/assets/js/lesson.js`
  - `academy/flipper-zero/assets/js/overview.js`

## Templates (start here)
Use the canonical templates:
- `academy/flipper-zero/templates/TEMPLATE_LESSON.html`
- `academy/flipper-zero/templates/TEMPLATE_OVERVIEW.html`

> Do not “freestyle” new patterns into lesson pages.

> **Security that is enforced doesn't feel heroic, but if you stay ready, you'll never have to get ready.**


## Before you open a PR
Run the hardening checks:
```bash
./scripts/validate-html-hardening.sh
