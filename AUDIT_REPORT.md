# Codebase Inconsistency Audit Report
**Generated**: 2025-01-27  
**Scope**: Full repository scan for structural inconsistencies, duplicates, and violations

---

## 🚨 CRITICAL ISSUES (Build-Breaking)

### ✅ FIXED: Root `package.json` JSON Syntax Errors
**Location**: `/package.json`  
**Issues Found**:
1. Missing closing bracket for `workspaces` array
2. Missing commas between first 3 script entries
3. Trailing comma after last script entry
4. Mixed tab/space indentation

**Status**: ✅ **FIXED** - All JSON syntax errors corrected

### ✅ FIXED: Design System `package.json` JSON Syntax Errors
**Location**: `/design-system/package.json`  
**Issues Found**:
1. Trailing comma in exports object
2. Invalid escape sequence in `tokens:clean` script
3. Trailing comma after last script entry

**Status**: ✅ **FIXED** - All JSON syntax errors corrected

---

## ⚠️ HIGH PRIORITY ISSUES

### 1. Duplicate Script Files (Different Versions)
**Affected Files**:
- `/scripts/assert-deterministic-build.mjs` vs `/scripts/assertions/assert-deterministic-build.mjs`
- `/scripts/assert-workspace-boundaries.mjs` vs `/scripts/assertions/assert-workspace-boundaries.mjs`

**Analysis**:
- Files are **DIFFERENT** (not identical copies)
- Root `package.json` references `/scripts/` versions
- CI workflow (`ci-clean.yml`) references `/scripts/` versions
- `/scripts/assertions/` appears to be an organizational structure with EXPLAINERS.md

**Risk**: Maintenance divergence - updates to one version may not propagate to the other

**Recommendation**: 
- **Option A**: Delete `/scripts/assertions/` duplicates, keep canonical versions in `/scripts/`
- **Option B**: Move canonical versions to `/scripts/assertions/`, update all references
- **Option C**: Keep `/scripts/` as symlinks/imports from `/scripts/assertions/`

---

### 2. Orphaned Root-Level CSS Files
**Affected Files** (all in root `/`):
- `base.css` - IDENTICAL to `/assets/css/base.css`
- `components.css` - DIFFERENT from `/assets/css/components.css`
- `homepage.css` - DIFFERENT from `/assets/css/homepage.css`
- `layout.css` - DIFFERENT from `/assets/css/layout.css`
- `nav.css` - DIFFERENT from `/assets/css/nav.css`

**Analysis**:
- No HTML files reference root-level CSS (all use `/assets/css/` paths)
- Root-level files appear to be orphaned/outdated copies
- Size differences suggest they're outdated versions

**Risk**: Confusion during development, potential for editing wrong file

**Recommendation**: Delete all root-level CSS files (5 total)

---

### 3. Duplicate JavaScript File (Minor Differences)
**Affected Files**:
- `/main.js` vs `/assets/js/main.js`

**Analysis**:
- Files are **nearly identical** (only comment wording differs)
- All HTML files reference `/assets/js/main.js`
- Root-level `main.js` is orphaned

**Recommendation**: Delete `/main.js`

---

## ✅ RESOLVED ISSUES

### 1. Node Version Consistency
**Status**: ✅ **FIXED**
- `.nvmrc`: 22 → 20 ✓
- `.devcontainer/devcontainer.json`: Node 22 → 20 ✓
- `scripts/ci-preflight.mjs`: Hardcoded 20 ✓
- `scripts/assertions/assert-preflight.mjs`: Hardcoded 20 ✓
- `.github/workflows/ci.yml`: Reads from `.nvmrc` ✓

**All files now aligned to Node 20**

---

## ✅ COMPLIANCE VERIFIED

### Gold Standard Hardening (Academy Files)
**Scope**: `/academy/flipper-zero/` lessons and templates  
**Rules Checked**:
- ✅ No inline JavaScript (`<script>...</script>` blocks)
- ✅ No inline event handlers (`onclick=`, `onload=`, etc.)
- ✅ No inline CSS (`<style>...</style>` blocks)
- ✅ External module loaders only (`<script type="module" src="...">`)

**Status**: ✅ **COMPLIANT** - No violations found in 6 lessons + 2 templates

### JSON Schema Validation
**Files Validated**: 10 total
- ✅ `.devcontainer/devcontainer.json`
- ✅ `design-system/schemas/tokens.schema.json`
- ✅ `design-system/tokens/themes/dark.json`
- ✅ `design-system/tokens/themes/light.json`
- ✅ `design-system/tokens/aliases.json`
- ✅ `design-system/tokens/base.json`
- ✅ `design-system/tokens/context.json`
- ✅ `design-system/tokens/semantic.json`
- ✅ `design-system/package.json`
- ✅ `package.json`

**Status**: ✅ **ALL VALID** - No JSON parsing errors

### Token Build System
**Verification Results**:
```
✓ npm run tokens:lint - Token schema + contract checks PASSED
✓ npm run tokens:verify - All outputs present and deterministic
  - tokens.light.ts ✓
  - tokens.light.css ✓
  - tokens.dark.ts ✓
  - tokens.dark.css ✓
```

**Status**: ✅ **FULLY FUNCTIONAL**

---

## 📋 RECOMMENDED ACTIONS

### Immediate (Build Integrity)
1. ✅ Fix root `package.json` syntax - **COMPLETED**
2. ✅ Fix design-system `package.json` syntax - **COMPLETED**
3. ✅ Standardize Node version to 20 - **COMPLETED**

### High Priority (Maintenance Risk)
4. ⚠️ **Resolve script duplication** - Choose canonical location for assertion scripts
5. ⚠️ **Delete orphaned CSS files** - Remove 5 root-level CSS files
6. ⚠️ **Delete orphaned JS file** - Remove root-level `main.js`

### Medium Priority (Code Hygiene)
7. Consider adding `npm run assert` script that runs all assertions (as documented in EXPLAINERS.md)
8. Add `html:hardening` script to `package.json` (referenced in ci-clean.yml but missing)

---

## 🎯 SUMMARY

| Category | Issues Found | Fixed | Remaining |
|----------|-------------|-------|-----------|
| **Critical (Build-Breaking)** | 2 | 2 | 0 |
| **High Priority (Maintenance)** | 3 | 0 | 3 |
| **Medium Priority (Hygiene)** | 2 | 0 | 2 |
| **Compliance Violations** | 0 | 0 | 0 |

**Overall Status**: 🟢 **Build System Operational** / 🟡 **Maintenance Issues Present**
