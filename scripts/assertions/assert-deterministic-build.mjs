import { execSync } from "node:child_process";
import fs from "node:fs";
import crypto from "node:crypto";

function fail(msg) {
  console.error(`\n❌ NON-DETERMINISTIC BUILD:\n${msg}\n`);
  process.exit(1);
}

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function hashFile(file) {
  const data = fs.readFileSync(file);
  return crypto.createHash("sha256").update(data).digest("hex");
}

/* 1. Ensure clean state */
if (run("git status --porcelain") !== "") {
  fail("Working tree not clean before build");
}

/* 2. Load allowlist */
const allowlist = fs.readFileSync(
  "scripts/determinism-allowlist.txt",
  "utf8"
).split("\n").map(l => l.trim()).filter(Boolean);

/* 3. Snapshot hashes BEFORE build */
const before = {};
for (const file of allowlist) {
  if (!fs.existsSync(file)) {
    fail(`Missing allowlisted file before build: ${file}`);
  }
  before[file] = hashFile(file);
}

/* 4. Run build */
run("npm run tokens:build");

/* 5. Snapshot hashes AFTER build */
const after = {};
for (const file of allowlist) {
  if (!fs.existsSync(file)) {
    fail(`Missing allowlisted file after build: ${file}`);
  }
  after[file] = hashFile(file);
}

/* 6. Compare */
const changed = allowlist.filter(f => before[f] !== after[f]);

if (changed.length > 0) {
  fail(
    `Output hashes changed:\n${changed.map(f => ` - ${f}`).join("\n")}`
  );
}

console.log("✅ Deterministic build verified via SHA-256 hashes");
