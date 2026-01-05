#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-.}"
TARGET_DIR="$ROOT_DIR"

fail=0
echo "Running JS safety checks under: $TARGET_DIR"
echo

# Blocklist patterns (tighten over time)
patterns=(
  '\beval\s*\('
  'new\s+Function\s*\('
  'document\.write\s*\('
)

# Warn patterns (not always wrong, but risky)
warn_patterns=(
  '\.innerHTML\s*='
  '\.outerHTML\s*='
  '\.insertAdjacentHTML\s*\('
)

for pat in "${patterns[@]}"; do
  if grep -RIn --include="*.js" -E "$pat" "$TARGET_DIR" >/dev/null; then
    echo "FAIL: Found dangerous pattern: $pat"
    grep -RIn --include="*.js" -E "$pat" "$TARGET_DIR" || true
    echo
    fail=1
  fi
done

for pat in "${warn_patterns[@]}"; do
  if grep -RIn --include="*.js" -E "$pat" "$TARGET_DIR" >/dev/null; then
    echo "WARN: Found risky pattern: $pat"
    grep -RIn --include="*.js" -E "$pat" "$TARGET_DIR" || true
    echo
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo "JS safety checks FAILED."
  exit 2
fi

echo "JS safety checks PASSED."
