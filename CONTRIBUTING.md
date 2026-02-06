# Contributing

This repository prioritizes determinism, auditability, and long-term maintainability.
All contributors (including maintainers) are expected to follow the workflow below.

## Development & Contribution Workflow

### 1. Source of Truth
- The `main` branch represents the canonical production state.
- ZIP files, generated artifacts, and compiled outputs are **never** committed as sources of truth.
- Only human-readable, diffable source files are committed.

### 2. Local Development Rules
- Never develop directly on `main`.
- All work is performed on a feature or fix branch created from `main`.

```bash
git pull --rebase origin main
git switch -c <type>/<short-description>
```

Example branch names:
- `fix/style-dictionary-format`
- `feat/token-schema-validation`
- `chore/docs-hardening`

### 3. Making Changes
- Replace files when synchronizing changes; do not “skip existing files.”
- File state convergence is mandatory—hybrid states are not acceptable.
- Validate changes locally before committing.

### 4. Commit Standards
- Commits must be atomic and scoped.
- Commit messages follow this format:

```
<type>(scope): concise description
```

Examples:
- `fix(style-dictionary): use format instead of formatter`
- `chore(tokens): add schema validation`

- Commits should be signed once signing is enabled.

### 5. Pushing & Merging
- Push branches to origin and open a Pull Request.
- Direct pushes to `main` are discouraged and reserved for administrative emergencies only.
- Pull Requests must pass all automated checks before merge.

```bash
git push -u origin <branch-name>
```

### 6. Line Endings & Formatting
- The repository standard is LF line endings.
- `.gitattributes` enforces normalization; contributors should not override it.

### 7. Build & Validation Expectations
Before opening a Pull Request, ensure:

```bash
npm run tokens:clean
npm run tokens:build
```

- Token builds must succeed.
- Schema and lint violations are treated as errors once enforced.

### 8. Philosophy
- Speed is secondary to correctness.
- Silent drift is worse than visible failure.
- If a process feels ambiguous, it must be documented or automated.
