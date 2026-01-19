# CI Assertion Explainers

This document explains **why each CI assertion exists** and how to respond when it fails.

CI failures are not errors — they are **violated guarantees**.

---

## Assertion: Preflight Invariants

**What it enforces**
- Correct Node version
- No forbidden lifecycle scripts
- No root-level node_modules
- Expected outputs exist

**Why this exists**
- Prevents environment drift
- Eliminates hidden side effects
- Ensures CI and local runs are equivalent

**What to do when it fails**
- Check Node version (`node -v`)
- Inspect root `package.json` scripts
- Remove unintended dependencies from root
- Run `npm run ci:preflight` locally

---

## Assertion: Workspace Boundary Enforcement

**What it enforces**
- No imports into internal design-system paths
- Controlled public surface only

**Why this exists**
- Prevents tight coupling
- Preserves modularity
- Keeps future refactors safe

**What to do when it fails**
- Replace deep imports with public exports
- Update `design-system/outputs/index.js` if exposure is intentional

---

## Assertion: Deterministic Token Build

**What it enforces**
- Token outputs are byte-for-byte identical across builds

**Why this exists**
- Prevents accidental output drift
- Guarantees reproducibility
- Makes changes intentional and reviewable

**What to do when it fails**
- Inspect token inputs for nondeterminism
- Verify dependency versions
- Update allowlist only if change is intentional

---

## How to Reproduce CI Locally

Run all CI assertions locally:

```bash
npm run assert
