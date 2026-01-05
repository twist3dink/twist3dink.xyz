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

const OUT_DIR = path.join(ROOT, "outputs");

const SCHEMA_PATH = path.join(ROOT, "schemas", "tokens.schema.json");



const files = ["base.json", "semantic.json", "context.json", "aliases.json"].map(f => path.join(TOKENS_DIR, f));



function readJSON(p) {

  return JSON.parse(fs.readFileSync(p, "utf8"));

}



function sha256File(p) {

  const buf = fs.readFileSync(p);

  return crypto.createHash("sha256").update(buf).digest("hex");

}



/** Contract rules beyond JSON schema */

function validateContracts({ base, semantic, context, aliases }) {

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

  const baseNamespaces = ["color", "space", "size", "radius", "font", "weight", "duration", "easing", "z"];

  for (const r of semRefs) {

    if (!startsWithAny(r, baseNamespaces)) errors.push(`semantic.json: illegal reference "{${r}}". Semantic may only reference base tokens.`);

  }



  // context refs must be either base namespaces or semantic namespaces

  const semanticNamespaces = ["color", "space", "size", "radius", "font", "weight", "duration", "easing", "z"];

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



const base = readJSON(files[0]);

const semantic = readJSON(files[1]);

const context = readJSON(files[2]);

const aliases = readJSON(files[3]);



for (const [name, json] of [["base.json", base], ["semantic.json", semantic], ["context.json", context], ["aliases.json", aliases]]) {

  const res = v.validate(json, schema);

  if (!res.valid) {

    console.error(`Schema validation failed for ${name}:`);

    for (const e of res.errors) console.error(`- ${e.stack}`);

    process.exit(1);

  }

}



// 2) Contract validation

const contractErrors = validateContracts({ base, semantic, context, aliases });

if (contractErrors.length) {

  console.error("Token contract validation failed:");

  for (const e of contractErrors) console.error(`- ${e}`);

  process.exit(1);

}

// 3) Build outputs via Style Dictionary

ensureDir(OUT_DIR);



// Style Dictionary expects tokens merged; we feed all and let ref resolution happen.

// IMPORTANT: We will generate outputs for semantic layer (consumption), not base.

const sd = new StyleDictionary({
  source: files,
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "outputs/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            selector: ":root",
            outputReferences: true
          }
        }
      ]
    },
    ts: {
      transformGroup: "js",
      buildPath: "outputs/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/es6",
          options: { outputReferences: true }
        }
      ]
    }
  }
});

await sd.hasInitialized;
await sd.buildAllPlatforms();


// 4) Emit build fingerprint so CI can detect drift

const fingerprint = {

  base: sha256File(files[0]),

  semantic: sha256File(files[1]),

  context: sha256File(files[2]),

  aliases: sha256File(files[3])

};

fs.writeFileSync(path.join(OUT_DIR, "tokens.fingerprint.json"), JSON.stringify(fingerprint, null, 2));

console.log("Tokens built successfully.");
