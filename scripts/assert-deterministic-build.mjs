import { execSync } from "node:child_process";
import fs from "node:fs";

function fail(msg) {
  console.error(`\n❌ NON-DETERMINISTIC BUILD:\n${msg}\n`);
  process.exit(1);
}

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

/* 1. Ensure git is clean before build */
if (run("git status --porcelain") !== "") {
  fail("Working tree not clean before build");
}

/* 2. Run the token build */
run("npm run tokens:build");

/* 3. Check git diff */
const diff = run("git status --porcelain");

if (!diff) {
  console.log("✅ Deterministic build: no changes detected");
  process.exit(0);
}

/* 4. Load allowlist */
const allowed = new Set(
  fs.readFileSync("scripts/determinism-allowlist.txt", "utf8")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
);

/* 5. Validate changes */
const violations = diff
  .split("\n")
  .map(line => line.slice(3))
  .filter(file => !allowed.has(file));

if (violations.length > 0) {
  fail(
    `Unexpected files changed:\n${violations.map(v => ` - ${v}`).join("\n")}`
  );
}

console.log("✅ Deterministic build (only allowed outputs changed)");
