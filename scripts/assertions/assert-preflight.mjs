import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function fail(msg) {
  console.error(`\n❌ CI PRECHECK FAILED:\n${msg}\n`);
  process.exit(1);
}

/* 1. Enforce Node version */
const requiredNodeMajor = 20;
const nodeMajor = Number(process.versions.node.split(".")[0]);

if (nodeMajor !== requiredNodeMajor) {
  fail(`Node ${requiredNodeMajor} required. Found ${process.versions.node}`);
}

/* 2. Enforce npm version existence */
try {
  execSync("npm --version", { stdio: "ignore" });
} catch {
  fail("npm is not available in PATH");
}

/* 3. Forbid lifecycle scripts at root */
const rootPkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const forbidden = ["preinstall", "postinstall", "prepare", "setup"];

for (const key of forbidden) {
  if (rootPkg.scripts?.[key]) {
    fail(`Forbidden lifecycle script detected: "${key}"`);
  }
}

/* 4. Enforce design-system isolation */
if (fs.existsSync("node_modules")) {
  fail("Root-level node_modules detected. Dependencies must live in subpackages only.");
}

/* 5. Verify deterministic outputs exist */
const outputs = [
  "design-system/outputs/tokens.light.ts",
  "design-system/outputs/tokens.dark.ts",
];

for (const file of outputs) {
  if (!fs.existsSync(file)) {
    fail(`Missing expected token output: ${file}`);
  }
}

console.log("✅ CI preflight checks passed");
