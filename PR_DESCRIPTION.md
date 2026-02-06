# Fix CI: Add Missing html:hardening Script Reference

## Summary
Adds the missing `html:hardening` script to `package.json` to fix the Flipper Zero HTML hardening CI job.

## Problem
The CI workflow (`ci-clean.yml`) referenced `npm run html:hardening`, but this script didn't exist in `package.json`. The fallback (`|| echo "Replace with actual commands..."`) prevented CI failures, but the actual hardening checks weren't running.

## Solution
Added script reference to `package.json`:
```json
"html:hardening": "bash scripts/validate-html-hardening.sh"
```

## Changes Made
- ✅ Added `html:hardening` script to `/package.json`
- ✅ Created `CI_STATUS_REPORT.md` (documents changes and CI status)
- ✅ Created `AUDIT_REPORT.md` (full codebase consistency audit)

## No Files Deleted
All pedagogical artifacts preserved as designed:
- Root-level CSS files (5 files) - preserved
- Root-level `main.js` - preserved  
- Duplicate scripts in `/scripts/` and `/scripts/assertions/` - preserved

These "orphaned" files serve as learning opportunities for understanding system evolution and reference tracing.

## CI Status
Both CI jobs should now pass:
- ✅ **design-system**: Token validation, workspace boundaries, deterministic build
- ✅ **flipper-zero**: HTML hardening checks (now properly wired)

## Testing
Pre-commit git hook already validated:
```
Running HTML hardening checks under: ./academy/flipper-zero
WARN: No CSP meta tag found in HTML (may be set via headers instead).
Hardening checks PASSED.
```

## Related Documentation
- See `CI_STATUS_REPORT.md` for full analysis
- See `AUDIT_REPORT.md` for comprehensive codebase audit findings
