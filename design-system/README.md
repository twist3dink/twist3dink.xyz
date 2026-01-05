# Design System

This folder contains the **design token source of truth** and a deterministic build pipeline that produces **consumption artifacts** (CSS variables + TypeScript exports).

## Policy

- **A2:** Outputs are generated in CI (or locally for development) and should **not** be committed.
- **B1:** Consumption outputs include **semantic + context** (base primitives are for reference resolution only).
- **C2:** CSS variables are namespaced with `--ds-...`.
- **D2:** TypeScript output is emitted as `as const` with inferred types.
- **E2 / E2a:** Optional light/dark themes are supported using `:root` and `[data-theme="dark"]`.
- **F3:** Experimental aliases are **blocked by default** and only build when explicitly enabled.

## Structure

- `tokens/`
  - `base.json` — primitives (**literal values only**)
  - `semantic.json` — semantic tokens (**references only**)
  - `context.json` — contextual bindings (**references only**)
  - `aliases.json` — experimental aliases (**references only**, under `experimental.*`) — **blocked unless enabled**
  - `themes/`
    - `light.json` — optional light theme overrides (**references only**)
    - `dark.json` — optional dark theme overrides (**references only**)
- `schemas/tokens.schema.json` — JSON Schema for tokens
- `build/build-tokens.mjs` — build + contract validation + output generation
- `outputs/` — generated artifacts (ignored by git)

## Build

From `design-system/`:

```bash
npm install

# Build consumption outputs (tokens.css + tokens.ts)
npm run tokens:build

# Build and verify required outputs exist
npm run tokens:verify
```

### Experimental outputs (opt-in)

```bash
# Emits tokens.experimental.css and tokens.experimental.ts
npm run tokens:build:experimental
```

## Outputs

- `outputs/tokens.css`
  - `:root` block (light/default)
  - `[data-theme="dark"]` block (dark overrides) when both theme files exist
- `outputs/tokens.ts`
  - `export const tokens = ... as const`
  - `export const tokensDark = ... as const` when both theme files exist
  - inferred types via `typeof`

## Contract rules (enforced)

`build/build-tokens.mjs` enforces:

- Token keys: lowercase `a-z0-9` only (no underscores, spaces, or camelCase).
- `base.json` values must be **literals** (no `{ref}` values).
- `semantic.json`, `context.json` values must be **references only** (`{path.to.token}`).
- `tokens/themes/*.json` values must be **references only** (when present).
- `aliases.json` is **excluded** unless `ENABLE_EXPERIMENTAL=1` is set.
- `aliases.json` must have a single top-level key: `experimental`.
