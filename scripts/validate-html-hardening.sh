#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-.}"
TARGET_DIR="$ROOT_DIR/academy/flipper-zero"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "ERROR: Target directory not found: $TARGET_DIR"
  exit 1
fi

fail=0

echo "Running HTML hardening checks under: $TARGET_DIR"
echo

# Rule 1: No inline event handlers (onclick=, onload=, etc.)
if grep -RIn --include="*.html" -E '\son[a-zA-Z]+\s*=' "$TARGET_DIR" >/dev/null; then
  echo "FAIL: Inline event handlers found (e.g., onclick=, onload=)."
  grep -RIn --include="*.html" -E '\son[a-zA-Z]+\s*=' "$TARGET_DIR" || true
  echo
  fail=1
fi

# Rule 2: No javascript: URLs in href/src
if grep -RIn --include="*.html" -E '(href|src)\s*=\s*["'"'"']\s*javascript:' "$TARGET_DIR" >/dev/null; then
  echo "FAIL: javascript: URLs found in href/src."
  grep -RIn --include="*.html" -E '(href|src)\s*=\s*["'"'"']\s*javascript:' "$TARGET_DIR" || true
  echo
  fail=1
fi

# Rule 3: CSP present (basic check)
if ! grep -RIn --include="*.html" -E '<meta[^>]+http-equiv=["'"'"']Content-Security-Policy["'"'"']' "$TARGET_DIR" >/dev/null; then
  echo "WARN: No CSP meta tag found in HTML (may be set via headers instead)."
  echo
fi

if [[ "$fail" -ne 0 ]]; then
  echo "Hardening checks FAILED."
  exit 2
fi

echo "Hardening checks PASSED."
