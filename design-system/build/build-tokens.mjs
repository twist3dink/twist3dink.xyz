import fs from "node:fs";

import path from "node:path";

import crypto from "node:crypto";

import StyleDictionary from "style-dictionary";

import { fileURLToPath } from "node:url";

import { Validator } from "jsonschema";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// build-tokens.mjs lives in: design-system/build/
// so ROOT is: design-system/
const ROOT = path.resolve(__dirname, "..");


const TOKENS_DIR = path.join(ROOT, "tokens");

// Note: Style Dictionary buildPath is relative to process.cwd() unless absolute.
// Use an absolute path to make builds deterministic regardless of where the script is run.
const OUT_DIR = path.join(ROOT, "outputs");

const SCHEMA_PATH = path.join(ROOT, "schemas", "tokens.schema.json");



// Core token files (always present)
const CORE_FILES = ["base.json", "semantic.json", "context.json"].map((f) => path.join(TOKENS_DIR, f));

// Experimental aliases are blocked unless explicitly enabled (F3).
const ENABLE_EXPERIMENTAL = process.env.ENABLE_EXPERIMENTAL === "1";
const ALIASES_FILE = path.join(TOKENS_DIR, "aliases.json");

// Theme overrides (E2/E2a). These files are optional; if missing, we build a single-theme output.
const THEMES_DIR = path.join(TOKENS_DIR, "themes");
const LIGHT_THEME_FILE = path.join(THEMES_DIR, "light.json");
const DARK_THEME_FILE = path.join(THEMES_DIR, "dark.json");
const HAS_LIGHT_THEME = fs.existsSync(LIGHT_THEME_FILE);
const HAS_DARK_THEME = fs.existsSync(DARK_THEME_FILE);

const files = [...CORE_FILES, ...(ENABLE_EXPERIMENTAL ? [ALIASES_FILE] : [])];



function readJSON(p) {

  return JSON.parse(fs.readFileSync(p, "utf8"));

}



function sha256File(p) {

  const buf = fs.readFileSync(p);

  return crypto.createHash("sha256").update(buf).digest("hex");

}



/** Contract rules beyond JSON schema */

function validateContracts({ base, semantic, context, aliases, themeLight, themeDark }) {

  const errors = [];



  // 1) Naming rules: lowercase, digits allowed, no spaces, no camelCase, no underscores.

  const validKey = (k) => /^[a-z0-9]+$/.test(k);



  function walk(obj, prefix = []) {

    for (const [k, v] of Object.entries(obj)) {

      if (!validKey(k)) errors.push(`Invalid key "${[...prefix, k].join(".")}" (only lowercase a-z0-9)`);

      if (typeof v === "object" && v !== null) walk(v, [...prefix, k]);

      if (typeof v === "string") {

        // ok

      }

    }

  }



  walk(base);

  walk(semantic);

  walk(context);

  walk(aliases);



  // 2) Reference rules:

  // - base values must be literals (NOT "{...}")

  // - semantic/context/aliases values must be references ("{...}") ONLY (no raw literals)

  const isRef = (s) => typeof s === "string" && /^\{[a-z0-9]+(\.[a-z0-9]+)*\}$/.test(s);



  function assertLeafs(obj, predicate, label, pfx = []) {

    for (const [k, v] of Object.entries(obj)) {

      if (typeof v === "object" && v !== null) assertLeafs(v, predicate, label, [...pfx, k]);

      if (typeof v === "string" && !predicate(v)) {

        errors.push(`${label}: invalid value at "${[...pfx, k].join(".")}" => "${v}"`);

      }

    }

  }



  // base must be literal (NOT reference)

  assertLeafs(base, (s) => !isRef(s), "base.json");



  // others must be refs only

  assertLeafs(semantic, (s) => isRef(s), "semantic.json");

  assertLeafs(context, (s) => isRef(s), "context.json");

  assertLeafs(aliases, (s) => isRef(s), "aliases.json");

  // themes (optional) must also be refs only
  if (themeLight && Object.keys(themeLight).length) assertLeafs(themeLight, (s) => isRef(s), "themes/light.json");
  if (themeDark && Object.keys(themeDark).length) assertLeafs(themeDark, (s) => isRef(s), "themes/dark.json");



  // 3) Layer reference constraints:

  // - semantic may reference base only

  // - context may reference base or semantic only (recommended: semantic)

  // - aliases may reference semantic/context/base, but must stay under "experimental" top key

  function collectRefs(obj, refs = []) {

    for (const v of Object.values(obj)) {

      if (typeof v === "object" && v !== null) collectRefs(v, refs);

      if (typeof v === "string" && isRef(v)) refs.push(v.slice(1, -1)); // strip {}

    }

    return refs;

  }



  const semRefs = collectRefs(semantic);

  const ctxRefs = collectRefs(context);

  const aliRefs = collectRefs(aliases);



  const startsWithAny = (s, prefixes) => prefixes.some(p => s === p || s.startsWith(p + "."));



  // semantic refs must start with known base namespaces

  // (you can widen this list later as base expands)

  const baseNamespaces = ["color", "space", "size", "radius", "font", "weight", "duration", "easing", "z", "shadow"];
  for (const r of semRefs) {

    if (!startsWithAny(r, baseNamespaces)) errors.push(`semantic.json: illegal reference "{${r}}". Semantic may only reference base tokens.`);

  }



  // context refs must be either base namespaces or semantic namespaces

  const semanticNamespaces = ["color", "space", "size", "radius", "font", "weight", "duration", "easing", "z", "shadow", "componenttokens"];
  for (const r of ctxRefs) {

    if (!startsWithAny(r, baseNamespaces) && !startsWithAny(r, semanticNamespaces)) {

      errors.push(`context.json: illegal reference "{${r}}".`);

    }

  }



  // aliases must be under experimental.*

  if (!("experimental" in aliases)) errors.push(`aliases.json: top-level key must be "experimental".`);

  for (const r of aliRefs) {

    // allow any reference, but still must be valid token path structure

    if (!/^[a-z0-9]+(\.[a-z0-9]+)*$/.test(r)) errors.push(`aliases.json: invalid reference path "{${r}}".`);

  }



  return errors;

}



function ensureDir(p) {

  fs.mkdirSync(p, { recursive: true });

}



// 1) Read + schema validate

const schema = readJSON(SCHEMA_PATH);

const v = new Validator();



const base = readJSON(CORE_FILES[0]);
const semantic = readJSON(CORE_FILES[1]);
const context = readJSON(CORE_FILES[2]);
const aliases = ENABLE_EXPERIMENTAL ? readJSON(ALIASES_FILE) : { experimental: {} };
const themeLight = HAS_LIGHT_THEME ? readJSON(LIGHT_THEME_FILE) : {};
const themeDark = HAS_DARK_THEME ? readJSON(DARK_THEME_FILE) : {};

const schemasToValidate = [
  ["base.json", base],
  ["semantic.json", semantic],
  ["context.json", context],
  ...(ENABLE_EXPERIMENTAL ? [["aliases.json", aliases]] : []),
  ...(HAS_LIGHT_THEME ? [["themes/light.json", themeLight]] : []),
  ...(HAS_DARK_THEME ? [["themes/dark.json", themeDark]] : [])
];

for (const [name, json] of schemasToValidate) {

  const res = v.validate(json, schema);

  if (!res.valid) {

    console.error(`Schema validation failed for ${name}:`);

    for (const e of res.errors) console.error(`- ${e.stack}`);

    process.exit(1);

  }

}



// 2) Contract validation

const contractErrors = validateContracts({ base, semantic, context, aliases, themeLight, themeDark });

if (contractErrors.length) {

  console.error("Token contract validation failed:");

  for (const e of contractErrors) console.error(`- ${e}`);

  process.exit(1);

}

// 3) Build outputs via Style Dictionary

ensureDir(OUT_DIR);



// Style Dictionary expects tokens merged; we feed all and let ref resolution happen.

// IMPORTANT: We will generate outputs for semantic layer (consumption), not base.

// We generate outputs for the *consumption* layer.
// By default that means semantic + context, excluding base primitives and experimental aliases.
// We generate outputs for the *consumption* layer (B1): semantic + context.
// Base is included for reference resolution only.
const isConsumptionToken = (token) => {
  const fp = token?.filePath || "";
  return (
    fp.endsWith(path.join("tokens", "semantic.json")) ||
    fp.endsWith(path.join("tokens", "context.json")) ||
    fp.endsWith(path.join("tokens", "themes", "light.json")) ||
    fp.endsWith(path.join("tokens", "themes", "dark.json"))
  );
};

// Custom TS output (D2): `as const` + inferred types.
StyleDictionary.registerFormat({
  name: "ts/const",
  // Style Dictionary expects `format` (not `formatter`).
  // Using `formatter` triggers: "Can't register format; format.format must be a function".
  format: ({ dictionary, file }) => {
    const exportName = file?.options?.exportName || "tokens";
    const filterFn = typeof file.filter === "function" ? file.filter : () => true;
    const tokens = dictionary.allTokens.filter((t) => filterFn(t));

    const out = {};
    for (const t of tokens) {
      let cur = out;
      for (let i = 0; i < t.path.length; i++) {
        const k = t.path[i];
        if (i === t.path.length - 1) {
          cur[k] = t.value;
        } else {
          cur[k] = cur[k] || {};
          cur = cur[k];
        }
      }
    }

    const json = JSON.stringify(out, null, 2);
    return [
      "/* Auto-generated by Style Dictionary. Do not edit manually. */",
      `export const ${exportName} = ${json} as const;`,
      `export type ${exportName[0].toUpperCase() + exportName.slice(1)} = typeof ${exportName};`,
      ""
    ].join("\n");
  }
});

const cssFileFor = (destination, selector) => ({
  destination,
  format: "css/variables",
  filter: isConsumptionToken,
  options: {
    selector,
    prefix: "ds",
    outputReferences: true
  }
});

const tsFileFor = (destination, exportName) => ({
  destination,
  format: "ts/const",
  filter: isConsumptionToken,
  options: { exportName, outputReferences: true }
});

async function buildTheme({ theme, selector, themeFile, exportName }) {
  const source = [...CORE_FILES, ...(ENABLE_EXPERIMENTAL ? [ALIASES_FILE] : [])];
  if (themeFile) source.push(themeFile);

  const sd = new StyleDictionary({
    source,
    platforms: {
      css: {
        transformGroup: "css",
        buildPath: OUT_DIR + path.sep,
        files: [cssFileFor(`tokens.${theme}.css`, selector)]
      },
      ts: {
        transformGroup: "js",
        buildPath: OUT_DIR + path.sep,
        files: [tsFileFor(`tokens.${theme}.ts`, exportName)]
      }
    }
  });

  await sd.buildAllPlatforms();
}

// Build light + dark (E2/E2a) when theme files exist; otherwise build single-theme defaults.
const hasBothThemes = HAS_LIGHT_THEME && HAS_DARK_THEME;
if (hasBothThemes) {
  await buildTheme({ theme: "light", selector: ":root", themeFile: LIGHT_THEME_FILE, exportName: "tokens" });
  await buildTheme({ theme: "dark", selector: '[data-theme="dark"]', themeFile: DARK_THEME_FILE, exportName: "tokensDark" });

  // Combine into single consumption outputs
  const css = [
    fs.readFileSync(path.join(OUT_DIR, "tokens.light.css"), "utf8"),
    "",
    fs.readFileSync(path.join(OUT_DIR, "tokens.dark.css"), "utf8"),
    ""
  ].join("\n");
  fs.writeFileSync(path.join(OUT_DIR, "tokens.css"), css);

  const ts = [
    fs.readFileSync(path.join(OUT_DIR, "tokens.light.ts"), "utf8"),
    fs.readFileSync(path.join(OUT_DIR, "tokens.dark.ts"), "utf8"),
    "",
    "export type Tokens = typeof tokens;",
    "export type TokensDark = typeof tokensDark;",
    ""
  ].join("\n");
  fs.writeFileSync(path.join(OUT_DIR, "tokens.ts"), ts);

  // Cleanup intermediates
  for (const f of ["tokens.light.css","tokens.dark.css","tokens.light.ts","tokens.dark.ts"]) {
    fs.rmSync(path.join(OUT_DIR, f), { force: true });
  }
} else {
  await buildTheme({ theme: "single", selector: ":root", themeFile: HAS_LIGHT_THEME ? LIGHT_THEME_FILE : null, exportName: "tokens" });
  fs.renameSync(path.join(OUT_DIR, "tokens.single.css"), path.join(OUT_DIR, "tokens.css"));
  fs.renameSync(path.join(OUT_DIR, "tokens.single.ts"), path.join(OUT_DIR, "tokens.ts"));
}

// Experimental outputs (F3): only emit when explicitly enabled.
if (ENABLE_EXPERIMENTAL) {
  const isExperimentalToken = (token) => {
    const fp = token?.filePath || "";
    return fp.endsWith(path.join("tokens", "aliases.json"));
  };

  const cssExpFileFor = (destination, selector) => ({
    destination,
    format: "css/variables",
    filter: isExperimentalToken,
    options: { selector, prefix: "ds", outputReferences: true }
  });

  const tsExpFileFor = (destination, exportName) => ({
    destination,
    format: "ts/const",
    filter: isExperimentalToken,
    options: { exportName, outputReferences: true }
  });

  async function buildExperimentalTheme({ theme, selector, themeFile, exportName }) {
    const source = [...CORE_FILES, ALIASES_FILE];
    if (themeFile) source.push(themeFile);
    const sd = new StyleDictionary({
      source,
      platforms: {
        css: { transformGroup: "css", buildPath: OUT_DIR + path.sep, files: [cssExpFileFor(`tokens.experimental.${theme}.css`, selector)] },
        ts: { transformGroup: "js", buildPath: OUT_DIR + path.sep, files: [tsExpFileFor(`tokens.experimental.${theme}.ts`, exportName)] }
      }
    });
    await sd.buildAllPlatforms();
  }

  if (hasBothThemes) {
    await buildExperimentalTheme({ theme: "light", selector: ":root", themeFile: LIGHT_THEME_FILE, exportName: "tokensExperimental" });
    await buildExperimentalTheme({ theme: "dark", selector: '[data-theme="dark"]', themeFile: DARK_THEME_FILE, exportName: "tokensExperimentalDark" });
    fs.writeFileSync(
      path.join(OUT_DIR, "tokens.experimental.css"),
      [
        fs.readFileSync(path.join(OUT_DIR, "tokens.experimental.light.css"), "utf8"),
        "",
        fs.readFileSync(path.join(OUT_DIR, "tokens.experimental.dark.css"), "utf8"),
        ""
      ].join("\n")
    );
    fs.writeFileSync(
      path.join(OUT_DIR, "tokens.experimental.ts"),
      [
        fs.readFileSync(path.join(OUT_DIR, "tokens.experimental.light.ts"), "utf8"),
        fs.readFileSync(path.join(OUT_DIR, "tokens.experimental.dark.ts"), "utf8"),
        ""
      ].join("\n")
    );
    for (const f of ["tokens.experimental.light.css","tokens.experimental.dark.css","tokens.experimental.light.ts","tokens.experimental.dark.ts"]) {
      fs.rmSync(path.join(OUT_DIR, f), { force: true });
    }
  } else {
    await buildExperimentalTheme({ theme: "single", selector: ":root", themeFile: HAS_LIGHT_THEME ? LIGHT_THEME_FILE : null, exportName: "tokensExperimental" });
    fs.renameSync(path.join(OUT_DIR, "tokens.experimental.single.css"), path.join(OUT_DIR, "tokens.experimental.css"));
    fs.renameSync(path.join(OUT_DIR, "tokens.experimental.single.ts"), path.join(OUT_DIR, "tokens.experimental.ts"));
  }
}
// 4) Emit build fingerprint so CI can detect drift

const fingerprint = {
  base: sha256File(CORE_FILES[0]),
  semantic: sha256File(CORE_FILES[1]),
  context: sha256File(CORE_FILES[2]),
  ...(ENABLE_EXPERIMENTAL ? { aliases: sha256File(ALIASES_FILE) } : {}),
  ...(HAS_LIGHT_THEME ? { themeLight: sha256File(LIGHT_THEME_FILE) } : {}),
  ...(HAS_DARK_THEME ? { themeDark: sha256File(DARK_THEME_FILE) } : {})
};

fs.writeFileSync(path.join(OUT_DIR, "tokens.fingerprint.json"), JSON.stringify(fingerprint, null, 2));

console.log("Tokens built successfully.");
