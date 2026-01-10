#!/usr/bin/env node
/**
 * run-build.mjs
 * Cross-platform launcher for build-tokens.mjs with optional flags.
 *
 * Usage:
 *   node ./build/run-build.mjs            # normal build
 *   node ./build/run-build.mjs --experimental
 */

import process from "node:process";

const args = new Set(process.argv.slice(2));
if (args.has("--experimental")) process.env.ENABLE_EXPERIMENTAL = "1";
if (args.has("--verbose")) process.env.TOKENS_VERBOSE = "1";

// Run lint then build
await import("./lint-tokens.mjs");
await import("./build-tokens.mjs");
