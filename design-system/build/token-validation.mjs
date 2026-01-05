import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { Validator } from "jsonschema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// token-validation.mjs lives in: design-system/build/
// so ROOT is: design-system/
export const ROOT = path.resolve(__dirname, "..");
export const TOKENS_DIR = path.join(ROOT, "tokens");
export const THEMES_DIR = path.join(TOKENS_DIR, "themes");
export const SCHEMA_PATH = path.join(ROOT, "schemas", "tokens.schema.json");

export const CORE_FILES = ["base.json", "semantic.json", "context.json"].map((f) =>
  path.join(TOKENS_DIR, f)
);

export const ALIASES_FILE = path.join(TOKENS_DIR, "aliases.json");
export const LIGHT_THEME_FILE = path.join(THEMES_DIR, "light.json");
export const DARK_THEME_FILE = path.join(THEMES_DIR, "dark.json");

export function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function sha256File(p) {
  const buf = fs.readFileSync(p);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function isTokenObject(v) {
  return typeof v === "object" && v !== null && Object.prototype.hasOwnProperty.call(v, "value");
}

function extractRefsFromString(s) {
  if (typeof s !== "string") return [];
  const refs = [];
  const re = /\{([a-z0-9]+(?:\.[a-z0-9]+)*)\}/g;
  let m;
  while ((m = re.exec(s))) refs.push(m[1]);
  return refs;
}

function containsAnyRef(s) {
  return extractRefsFromString(s).length > 0;
}

function isPureRef(s) {
  return typeof s === "string" && /^\{[a-z0-9]+(?:\.[a-z0-9]+)*\}$/.test(s);
}

function startsWithAny(s, prefixes) {
  return prefixes.some((p) => s === p || s.startsWith(p + "."));
}

function collectTokenPaths(obj, prefix = [], out = new Set()) {
  if (isTokenObject(obj)) {
    out.add(prefix.join("."));
    return out;
  }
  if (typeof obj !== "object" || obj === null) return out;
  for (const [k, v] of Object.entries(obj)) {
    collectTokenPaths(v, [...prefix, k], out);
  }
  return out;
}

function walkTokenValues(obj, cb, prefix = []) {
  if (isTokenObject(obj)) {
    cb(obj.value, prefix.join("."), obj);
    return;
  }
  if (typeof obj !== "object" || obj === null) return;
  for (const [k, v] of Object.entries(obj)) {
    walkTokenValues(v, cb, [...prefix, k]);
  }
}

/**
 * Contract rules beyond JSON schema.
 *
 * This is where we harden the pipeline so token authoring remains safe as the system scales.
 */
export function validateContracts({ base, semantic, context, aliases, themeLight, themeDark }) {
  const errors = [];

  // 1) Naming rules: lowercase, digits allowed; no spaces, underscores, dots, ampersands, or camelCase.
  //    We allow numeric keys (e.g., space.3) and descriptive keys (e.g., toxicgreen, lineheight).
  const validKey = (k) => /^[a-z0-9]+$/.test(k);

  function walkKeys(obj, prefix = []) {
    if (typeof obj !== "object" || obj === null) return;
    for (const [k, v] of Object.entries(obj)) {
      if (!validKey(k)) {
        errors.push(`Invalid key "${[...prefix, k].join(".")}" (allowed: lowercase a-z and 0-9 only)`);
      }
      // Continue walking even through token objects to ensure 'value', 'type', etc. stay compliant.
      if (typeof v === "object" && v !== null) walkKeys(v, [...prefix, k]);
    }
  }

  walkKeys(base);
  walkKeys(semantic);
  walkKeys(context);
  walkKeys(aliases);
  if (themeLight && Object.keys(themeLight).length) walkKeys(themeLight);
  if (themeDark && Object.keys(themeDark).length) walkKeys(themeDark);

  // 2) Value/reference rules (applied ONLY to token.value)
  // - base token values must be literals (must NOT contain any {ref})
  // - semantic/context/themes/aliases token values must contain at least one {ref}
  //   (pure refs are fine; composite strings that contain refs are allowed)
  const assertTokenValues = (obj, predicate, label) => {
    walkTokenValues(obj, (val, tokenPath) => {
      // Only validate strings; non-string values are allowed but must not be refs.
      if (typeof val === "string" && !predicate(val)) {
        errors.push(`${label}: invalid value at "${tokenPath}" => "${val}"`);
      }
    });
  };

  assertTokenValues(base, (s) => !containsAnyRef(s), "base.json");
  assertTokenValues(semantic, (s) => containsAnyRef(s), "semantic.json");
  assertTokenValues(context, (s) => containsAnyRef(s), "context.json");
  assertTokenValues(aliases, (s) => containsAnyRef(s), "aliases.json");
  if (themeLight && Object.keys(themeLight).length) assertTokenValues(themeLight, (s) => containsAnyRef(s), "themes/light.json");
  if (themeDark && Object.keys(themeDark).length) assertTokenValues(themeDark, (s) => containsAnyRef(s), "themes/dark.json");

  // 3) Layer reference constraints + existence checks.
  // Collect all token paths per layer.
  const basePaths = collectTokenPaths(base);
  const semanticPaths = collectTokenPaths(semantic);
  const contextPaths = collectTokenPaths(context);
  const aliasesPaths = collectTokenPaths(aliases);
  const themeLightPaths = collectTokenPaths(themeLight || {});
  const themeDarkPaths = collectTokenPaths(themeDark || {});

  // Namespace constraints (kept intentionally tight; widen deliberately as base grows).
  // Base primitives live under the "base" namespace to avoid collisions with semantic/consumption tokens.
  const baseNamespaces = ["base"];
  // Consumption layer namespaces (what downstream apps use). Keep this list tight and expand deliberately.
  const semanticNamespaces = ["base", "color", "space", "size", "radius", "font", "weight", "duration", "easing", "z", "shadow", "componenttokens"];

  // Helpers to validate references found in token values.
  const validateRefsInLayer = ({ obj, label, allowedNamespaces, allowedPathSets }) => {
    walkTokenValues(obj, (val, tokenPath) => {
      if (typeof val !== "string") return;
      const refs = extractRefsFromString(val);
      for (const r of refs) {
        if (!/^[a-z0-9]+(?:\.[a-z0-9]+)*$/.test(r)) {
          errors.push(`${label}: invalid reference "{${r}}" at "${tokenPath}"`);
          continue;
        }
        if (allowedNamespaces && !startsWithAny(r, allowedNamespaces)) {
          errors.push(`${label}: illegal reference "{${r}}" at "${tokenPath}" (namespace not allowed)`);
        }
        const exists = allowedPathSets.some((set) => set.has(r));
        if (!exists) {
          errors.push(`${label}: missing referenced token "{${r}}" at "${tokenPath}"`);
        }
      }
    });
  };

  // semantic may reference base only
  validateRefsInLayer({
    obj: semantic,
    label: "semantic.json",
    allowedNamespaces: baseNamespaces,
    allowedPathSets: [basePaths]
  });

  // context may reference base or semantic (recommended: semantic)
  validateRefsInLayer({
    obj: context,
    label: "context.json",
    allowedNamespaces: semanticNamespaces,
    allowedPathSets: [basePaths, semanticPaths]
  });

  // themes behave like overrides: allow base or semantic
  if (themeLight && Object.keys(themeLight).length) {
    validateRefsInLayer({
      obj: themeLight,
      label: "themes/light.json",
      allowedNamespaces: semanticNamespaces,
      allowedPathSets: [basePaths, semanticPaths]
    });
  }
  if (themeDark && Object.keys(themeDark).length) {
    validateRefsInLayer({
      obj: themeDark,
      label: "themes/dark.json",
      allowedNamespaces: semanticNamespaces,
      allowedPathSets: [basePaths, semanticPaths]
    });
  }

  // aliases must be under experimental.* and can reference base/semantic/context/themes.
  if (!("experimental" in aliases)) errors.push(`aliases.json: top-level key must be "experimental".`);
  validateRefsInLayer({
    obj: aliases,
    label: "aliases.json",
    allowedNamespaces: null,
    allowedPathSets: [basePaths, semanticPaths, contextPaths, themeLightPaths, themeDarkPaths, aliasesPaths]
  });

  // Enforce that aliases stay under experimental.*
  if (aliases && typeof aliases === "object" && aliases !== null) {
    for (const k of Object.keys(aliases)) {
      if (k !== "experimental") errors.push(`aliases.json: unexpected top-level key "${k}" (only "experimental" allowed)`);
    }
  }

  // 4) Optional strictness: semantic/context/themes SHOULD use pure refs (no composites).
  //    We do not enforce this by default; it blocks legitimate composite tokens (e.g., shadows).
  //    If you want to enforce pure refs only, flip this flag.
  const ENFORCE_PURE_REFS_ONLY = false;
  if (ENFORCE_PURE_REFS_ONLY) {
    const assertPure = (obj, label) => {
      walkTokenValues(obj, (val, tokenPath) => {
        if (typeof val === "string" && !isPureRef(val)) {
          errors.push(`${label}: expected pure reference at "${tokenPath}" => "${val}"`);
        }
      });
    };
    assertPure(semantic, "semantic.json");
    assertPure(context, "context.json");
    assertPure(themeLight || {}, "themes/light.json");
    assertPure(themeDark || {}, "themes/dark.json");
    assertPure(aliases, "aliases.json");
  }

  return errors;
}

export function validateSchemaOrExit(namedJsonList, schemaPath = SCHEMA_PATH) {
  const schema = readJSON(schemaPath);
  const v = new Validator();

  for (const [name, json] of namedJsonList) {
    const res = v.validate(json, schema);
    if (!res.valid) {
      console.error(`Schema validation failed for ${name}:`);
      for (const e of res.errors) console.error(`- ${e.stack}`);
      process.exit(1);
    }
  }
}

export function validateAllOrExit({ enableExperimental }) {
  const HAS_LIGHT_THEME = fs.existsSync(LIGHT_THEME_FILE);
  const HAS_DARK_THEME = fs.existsSync(DARK_THEME_FILE);

  const base = readJSON(CORE_FILES[0]);
  const semantic = readJSON(CORE_FILES[1]);
  const context = readJSON(CORE_FILES[2]);
  const aliases = enableExperimental ? readJSON(ALIASES_FILE) : { experimental: {} };
  const themeLight = HAS_LIGHT_THEME ? readJSON(LIGHT_THEME_FILE) : {};
  const themeDark = HAS_DARK_THEME ? readJSON(DARK_THEME_FILE) : {};

  const schemasToValidate = [
    ["base.json", base],
    ["semantic.json", semantic],
    ["context.json", context],
    ...(enableExperimental ? [["aliases.json", aliases]] : []),
    ...(HAS_LIGHT_THEME ? [["themes/light.json", themeLight]] : []),
    ...(HAS_DARK_THEME ? [["themes/dark.json", themeDark]] : [])
  ];

  validateSchemaOrExit(schemasToValidate, SCHEMA_PATH);

  const contractErrors = validateContracts({ base, semantic, context, aliases, themeLight, themeDark });
  if (contractErrors.length) {
    console.error("Token contract validation failed:");
    for (const e of contractErrors) console.error(`- ${e}`);
    process.exit(1);
  }

  return { base, semantic, context, aliases, themeLight, themeDark, HAS_LIGHT_THEME, HAS_DARK_THEME };
}
