import { execSync } from "node:child_process";

const assertions = [
  "assert-preflight.mjs",
  "assert-workspace-boundaries.mjs",
  "assert-deterministic-build.mjs"
];

for (const file of assertions) {
  console.log(`\n▶ Running ${file}`);
  execSync(`node scripts/assertions/${file}`, {
    stdio: "inherit"
  });
}

console.log(`
CI Assertion System
------------------
These checks enforce architectural and build invariants.
Failures indicate violated guarantees, not random errors.
`);
	  process.exitCode = 1;

