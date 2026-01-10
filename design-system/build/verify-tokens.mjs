#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "outputs");

const required = [
  path.join(OUT_DIR, "tokens.css"),
  path.join(OUT_DIR, "tokens.ts"),
  path.join(OUT_DIR, "tokens.fingerprint.json"),
];

function sh(cmd, args = [], opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: false, ...opts });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

function assertFileNonEmpty(p) {
  if (!fs.existsSync(p)) throw new Error(`[INVARIANT VIOLATION] Missing required output: ${p}`);
  const st = fs.statSync(p);
  if (!st.isFile() || st.size === 0) throw new Error(`[INVARIANT VIOLATION] Empty required output: ${p}`);
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

try {
  // 1) Lint (schema + contracts)
  sh("node", ["./build/lint-tokens.mjs"]);

  // 2) Clean build
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  sh("node", ["./build/build-tokens.mjs"]);

  // 3) Outputs exist
  for (const p of required) assertFileNonEmpty(p);

  const fp1 = readText(path.join(OUT_DIR, "tokens.fingerprint.json"));

  // 4) Determinism check (build again)
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  sh("node", ["./build/build-tokens.mjs"]);

  for (const p of required) assertFileNonEmpty(p);

  const fp2 = readText(path.join(OUT_DIR, "tokens.fingerprint.json"));

  if (fp1 !== fp2) {
    throw new Error("[INVARIANT VIOLATION] Non-deterministic token build: fingerprint drift detected");
  }

  console.log("✔ tokens:verify passed (outputs present, deterministic)");
} catch (err) {
  console.error(String(err?.stack || err));
  process.exit(1);
}
