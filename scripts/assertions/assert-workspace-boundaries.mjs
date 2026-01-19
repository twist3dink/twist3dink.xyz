import fs from "node:fs";
import path from "node:path";

function fail(msg) {
  console.error(`\n❌ WORKSPACE BOUNDARY VIOLATION:\n${msg}\n`);
  process.exit(1);
}

const ROOT = process.cwd();
const DESIGN_SYSTEM = path.join(ROOT, "design-system");

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      scan(full);
      continue;
    }

    if (!entry.name.endsWith(".js") && !entry.name.endsWith(".ts")) continue;

    const content = fs.readFileSync(full, "utf8");

    if (
      content.includes("design-system/") &&
      !full.startsWith(DESIGN_SYSTEM)
    ) {
      fail(
        `Illegal import into design-system internals:\n` +
        `File: ${path.relative(ROOT, full)}`
      );
    }
  }
}

scan(ROOT);

console.log("✅ Workspace boundary enforcement passed");
